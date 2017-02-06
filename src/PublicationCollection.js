import _ from 'underscore';
import Backbone from 'backbone';
import PublicationModel from './PublicationModel';

class PublicationCollection extends Backbone.Collection {
  constructor(models, options) {
    super(models, options);

    if (!(this.model.prototype instanceof PublicationModel) && this.model !== PublicationModel) {
      throw new Error('PublicationCollection models must derive from PublicationModel for syncing to work right.');
    }
    
    this._options = _.defaults({}, options, { startObservingChanges: true });
    this._reactiveQuery = options.reactiveQuery;
    this._waitOn = options.waitOn;

    if (this._waitOn) {
      this._waitOn.whenReady().then(function() {
        // Once the relevant subscription is ready, reset the collection to the
        // current state of the result set. (We've skipped over the initial
        // 'add' events.)
        this.reset(this._reactiveQuery.fetch());
        this.startObservingChanges();
      }.bind(this));
    } else if (this._options.startObservingChanges) {
      this.startObservingChanges();
    }
  }
  

  startObservingChanges() {
    this._reactiveQuery
      .on('added', function(id, fields) {
        var doc = _.extend({ _id: id }, fields);
        // If the collection was not instructed to wait for the relevant
        // subscription to become ready, this will be called for the initial
        // result set. Since that may overlap with the models with which the
        // collection was initialized, we merge the models.
        this.add(doc, { merge: true });
      }, this)
      .on('changed', function(id, fields) {
        var model = this.get(id);
        if (model) {
          var isUndefinedOrNull = function(field) {
            return _.isUndefined(field) || _.isNull(field);
          };
          var toUnset = _.deepPick(fields, isUndefinedOrNull);
          model.unset(toUnset);

          var toSet = _.deepOmit(fields, isUndefinedOrNull);
          model.set(toSet);
        }
      }, this)
      .on('removed', function(id) {
        var model = this.get(id);
        if (model) {
          this.remove(model);
        }
      }, this);
  }

  /**
   * Stop listening to the events established in `startObservingChanges`.
   */
  stopObservingChanges() {
    this._reactiveQuery.off('added changed removed');
  }

  set(models, options) {
    // Don't permit models to have their own reactive queries.
    if (models) {
      models = _.isArray(models) ? models : [models];

      var modelHasReactiveQuerySet = _.any(models, function(model) {
        // As opposed to being a raw attribute object.
        var modelIsMeteorModel = (model instanceof Backbone.MeteorModel);
        return modelIsMeteorModel && !!model._reactiveQuery;
      });

      if (modelHasReactiveQuerySet) {
        throw new Error('Models in reactive collections must delegate reactivity to the collection.');
      }
    }

    Backbone.Collection.prototype.set.apply(this, arguments);
  }
};

export default PublicationCollection;
