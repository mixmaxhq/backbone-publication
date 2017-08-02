import _ from 'underscore';
import Backbone from 'backbone';

import PublicationModel from './PublicationModel';
import ObjectUtils from './ObjectUtils';


/**
 * A PublicationCollection is a class that provides an integration point
 * between our usage of Backbone and our publications - it represents the state
 * of many individual documents (a collection).
 */
var PublicationCollection = Backbone.Collection.extend({
  // Document our unofficial internal API that we use to monitor for changes.
  _reactiveQuery: null,
  _waitOn: null,

  // Default to using the PublicationModel if no other model is provided.
  model: PublicationModel,

  /**
   * Creates the PublicationCollection and sets up handlers to listen to a
   * given reactive query once the subscription is ready (if we're told to
   * wait on it).
   *
   * @param {Object[]} models The initial models to insert into the collection.
   * @param {Object} options The initial options we'd like to honor.
   *    @property {Object} waitOn (optional) The subscription to wait to be
   *       ready.
   *    @property {Object} reactiveQuery The reactive query to monitor for
   *       updates.
   *    @property {Bool} startObservingChanges Whether or not to monitory the
   *       reactive query immediately.
   */
  initialize(models, options) {
    if (!(this.model.prototype instanceof PublicationModel) && this.model !== PublicationModel) {
      throw new Error('PublicationCollection models must derive from PublicationModel for syncing to work right.');
    }
    
    options = _.defaults({}, options, { startObservingChanges: true });
    this._reactiveQuery = options.reactiveQuery;
    this._waitOn = options.waitOn;

    this._boundOnAdded = this._onAdded.bind(this);
    this._boundOnChanged = this._onChanged.bind(this);
    this._boundOnRemoved = this._onRemoved.bind(this);

    if (this._waitOn) {
      this._waitOn.whenReady().then(() => {
        // Once the relevant subscription is ready, reset the collection to the
        // current state of the result set. (We've skipped over the initial
        // 'add' events.)
        this.reset(this._reactiveQuery.fetch());
        this.startObservingChanges();
      });
    } else if (options.startObservingChanges) {
      this.startObservingChanges();
    }
  },

  /**
   * Handles `added` events emitted by the reactive query.
   */
  _onAdded(id, fields) {
    var doc = _.extend({ _id: id }, fields);
    // If the collection was not instructed to wait for the relevant
    // subscription to become ready, this will be called for the initial
    // result set. Since that may overlap with the models with which the
    // collection was initialized, we merge the models.
    this.add(doc, { merge: true });
  },

  /**
   * Handles `changed` events emitted by the reactive query.
   */
  _onChanged(id, fields) {
    var model = this.get(id);
    if (model) {
      var isUndefinedOrNull = function(field) {
        return _.isUndefined(field) || _.isNull(field);
      };
      var toUnset = ObjectUtils.deepPick(fields, isUndefinedOrNull);
      model.unset(toUnset);

      var toSet = ObjectUtils.deepOmit(fields, isUndefinedOrNull);
      model.set(toSet);
    }
  },

  /**
   * Handles `removed` events emitted by the reactive query.
   */
  _onRemoved(id) {
    var model = this.get(id);
    if (model) {
      this.remove(model);
    }
  },

  /**
   * Starts observing the reactive query for changes.
   */
  startObservingChanges() {
    this._reactiveQuery
      .on('added', this._boundOnAdded)
      .on('changed', this._boundOnChanged)
      .on('removed', this._boundOnRemoved);
  },

  /**
   * Stop listening to the events established in `startObservingChanges`.
   */
  stopObservingChanges() {
    this._reactiveQuery
      .removeListener('added', this._boundOnAdded)
      .removeListener('changed', this._boundOnChanged)
      .removeListener('removed', this._boundOnRemoved);
  },

  set(models) {
    // Don't permit models to have their own reactive queries.
    if (models) {
      models = _.isArray(models) ? models : [models];

      var modelHasReactiveQuerySet = _.any(models, function(model) {
        // As opposed to being a raw attribute object.
        return (model instanceof PublicationModel) && !!model._reactiveQuery;
      });

      if (modelHasReactiveQuerySet) {
        throw new Error('Models in reactive collections must delegate reactivity to the collection.');
      }
    }

    PublicationCollection.__super__.set.apply(this, arguments);
  }
});

export default PublicationCollection;
