import _ from 'underscore';
import Backbone from 'backbone';

/**
 * A PublicationModel is a class that provides an integration point between
 * our usage of Backbone and our publications - it represents an individual
 * model's state.
 */
var PublicationModel = Backbone.Model.extend({
  /**
   * This must not be overridden in order for remote changes to merge cleanly.
   */
  idAttribute: '_id',

  /**
   * Specified for standalone models.
   * Must not be specified for models included in a reactive collection (such
   * models should delegate reactivity to the collection to avoid duplicate
   * processing and/or events).
   */
  _reactiveQuery: null,

  /**
   * Initializes the PublicationModel.
   *
   * @param {Object} attributes The attributes of the instance of this model.
   * @param {Object} options Any options we'd like to consider - primarily if
   *    we have a reactive query that we should be monitoring to detect
   *    changes for, or if we shouldn't start observing for changes
   *    immediately.
   *   @property {Bool} startObservingChanges Whether or not we should observe
   *      changes emitted by the reactiveQuery immediately.
   *   @property {Object} reactiveQuery An optional reactive query to monitor
   *      for additions or changes. Created via
   *      `PublicationClient::LocalCollection::find`.
   */
  initialize(attributes, options) {
    options = _.defaults({}, options, { startObservingChanges: true });

    this._boundOnAdded = this._onAdded.bind(this);
    this._boundOnChanged = this._onChanged.bind(this);

    this._reactiveQuery = options.reactiveQuery;
    if (this._reactiveQuery && options.startObservingChanges) {
      this.startObservingChanges();
    }
  },

  /**
   * Override set implementation with a deep extend in order to detect change in nested field
   * and not overwrite old nested field with the new nested field.
   */
  set(key, value, options) {
    if (_.isUndefined(key) || _.isNull(key)) return this;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    var newAttributes;
    if (typeof key === 'object') {
      newAttributes = key;
      options = value;
    } else {
      (newAttributes = {})[key] = value;
    }

    // Safety belt if user doesn't pass any options.
    options = options || {};

    // Determine the final attributes, merging in nested objects to prevent overwrite.
    var oldAttributes = _.omit(this.attributes, '_id', 'createdAt');
    var fullAttributes = _.deepExtend(oldAttributes, newAttributes);

    // Perform the standard Backbone.js set. Do this first, so when we trigger
    // events further down the new attributes are in place.
    if (options.unset) {
      PublicationModel.__super__.unset.call(this, fullAttributes, options);
    } else {
      PublicationModel.__super__.set.call(this, fullAttributes, options);
    }

    if (!options.silent) {
      // Trigger events for any nested objects.
      _.each(newAttributes, (value, key, attributes) => {
        if (_.isObject(value)) this.trigger('change:' + key, this, attributes[key], options);
      });

      // If the new attributes were all nested objects, trigger a general `change` event too.
      var allObjects = _.every(newAttributes, function(v) {
        return _.isObject(v);
      });
      if (allObjects) this.trigger('change', this, newAttributes, options);
    }

    return this;
  },

  /**
   * Starts observing the given reactive query for `added` and `changed` events.
   * It does not handle `removed` events which should be handled by the client.
   */
  startObservingChanges() {
    this._reactiveQuery
      .on('added', this._boundOnAdded)
      .on('changed', this._boundOnChanged);
    // Ignore `removed`--it's up to the client to destroy the model.
  },

  /**
   * Handles `added` events emitted by the reactive query.
   */
  _onAdded(id, fields) {
    // Sanity check.
    if (id !== this.id) return;

    // Merge the initial state of the model.
    this.set(fields);
  },

  /**
   * Handles `changed` events emitted by the reactive query.
   */
  _onChanged(id, fields) {
    // Sanity check.
    if (id !== this.id) return;

    var isUndefinedOrNull = function(field) {
      return _.isUndefined(field) || _.isNull(field);
    };
    var toUnset = _.deepPick(fields, isUndefinedOrNull);
    if (!_.isEmpty(toUnset)) this.unset(toUnset);

    var toSet = _.deepOmit(fields, isUndefinedOrNull);
    if (!_.isEmpty(toSet)) this.set(toSet);
  },

  /**
   * Sets the reactive query to the given reactive query.
   * NOTE: if you use this functionality, you'll need to also call
   * `startObservingChanges` in order to re-initialize the model's listeners.
   * If there was already a reactive query that was being monitored, we'll
   * stop listening to it before holding onto the new query reference.
   *
   * @param {Object} query A reactive query created via
   *    `PublicationClient::LocalCollection::find`.
   */
  setReactiveQuery(query) {
    if (this._reactiveQuery) this._reactiveQuery.stopObservingChanges();
    this._reactiveQuery = query;
  },

  /**
   * Stop listening to the events establishedd in `startObservingChanges`.
   */
  stopObservingChanges() {
    this._reactiveQuery
      .removeListener('added', this._boundOnAdded)
      .removeListener('changed', this._boundOnChanged);
  }
});

export default PublicationModel;
