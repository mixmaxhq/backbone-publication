import _ from 'underscore';
import Backbone from 'backbone';

class PublicationModel extends Backbone.Model {
  // This must not be overridden in order for remote changes to merge cleanly.
  get idAttribute() { return '_id'; }

  // Specified for standalone models.
  // Must not be specified for models included in a reactive collection
  // (such models should delegate reactivity to the collection to avoid
  // duplicate processing and/or events).
  get reactiveQuery() { return this._reactiveQuery; }

  initialize(attributes, options) {
    options = _.defaults({}, options, { startObservingChanges: true });

    this._reactiveQuery = options.reactiveQuery;

    if (this._reactiveQuery && options.startObservingChanges) {
      this.startObservingChanges();
    }
  }

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
      Backbone.Model.prototype.unset.call(this, fullAttributes, options);
    } else {
      Backbone.Model.prototype.set.call(this, fullAttributes, options);
    }

    if (!options.silent) {
      // Trigger events for any nested objects.
      _.each(newAttributes, function(value, key, attributes) {
        if (_.isObject(value)) this.trigger('change:' + key, this, attributes[key], options);
      }.bind(this));

      // If the new attributes were all nested objects, trigger a general `change` event too.
      var allObjects = _.every(newAttributes, function(v) {
        return _.isObject(v);
      });
      if (allObjects) this.trigger('change', this, newAttributes, options);
    }

    return this;
  }

  /**
   * Override unset implementation to use the overridden version of set above.
   */
  unset(key, value, options) {
    options = _.extend(options, { unset: true });
    this.set(key, value, options);
    return this;
  }

  startObservingChanges() {
    this._reactiveQuery
      .on('added', function(id, fields) {
        // Sanity check.
        if (id !== this.id) return;

        // Merge the initial state of the model.
        this.set(fields);
      }, this)
      .on('changed', function(id, fields) {
        // Sanity check.
        if (id !== this.id) return;

        var isUndefinedOrNull = function(field) {
          return _.isUndefined(field) || _.isNull(field);
        };
        var toUnset = _.deepPick(fields, isUndefinedOrNull);
        if (!_.isEmpty(toUnset)) this.unset(toUnset);

        var toSet = _.deepOmit(fields, isUndefinedOrNull);
        if (!_.isEmpty(toSet)) this.set(toSet);
      }, this);
    // Ignore `removed`--it's up to the client to destroy the model.
  }

  /**
   * @param {Object} query A reactive query created via `Meteor.find`
   */
  set reactiveQuery(query) {
    this._reactiveQuery = query;
  }

  /**
   * Stop listening to the events establishedd in `startObservingChanges`.
   */
  stopObservingChanges() {
    this._reactiveQuery.off('added changed');
  }
}

export default PublicationModel;
