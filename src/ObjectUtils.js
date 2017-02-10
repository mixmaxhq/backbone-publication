import _ from 'underscore';

/**
 * A collection of object-related utilities.
 */
var ObjectUtils = {
  /**
   * Performs a deep merge of two objects, source into target.
   *
   * @param  {Object} target
   * @param  {Object} source
   * @return {Object}
   */
  deepExtend: function(target, source) {
    _.each(source, function(value, key) {
      if (_.has(target, key) && ObjectUtils.isPlainObject(target[key]) && ObjectUtils.isPlainObject(source[key])) {
        ObjectUtils.deepExtend(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
    return target;
  },

  /**
   * Performs a deep pick of a given object.
   *
   * @param  {Object} fields The object to pick from
   * @param  {*List}         Accepts an array of acceptable field, a callback function or a list of arguments.
   * @return {Object}        Filtered out fields.
   */
  deepPick: function(fields, whitelist) {
    // arguments does not have `slice`, so convert to array first.
    if (_.isString(whitelist)) whitelist = _.rest(arguments);
    var picked = _.pick(fields, whitelist);
    var nested = _.pick(fields, function(f) {
      return _.isObject(f) && !_.isArray(f);
    });

    _.each(nested, function(value, key, object) {
      var localObj = ObjectUtils.deepPick(value, whitelist);
      if (!_.isEmpty(localObj)) picked[key] = localObj;
    });

    return picked;
  },

  /**
   * Performs a deep omit of a given object.
   *
   * @param  {Object} fields    The object to filter fields out.
   * @param  {*List} blacklist  Accepts an array of fields, a callback function, or a list of arguments.
   * @return {Object}           Objects with fields omitted.
   */
  deepOmit: function(fields, blacklist) {
    // arguments does not have `slice`, so convert to array first.
    if (_.isString(blacklist)) blacklist = _.rest(arguments);
    var omitted = _.omit(fields, blacklist);
    var nested = _.pick(fields, function(f) {
      return _.isObject(f) && !_.isArray(f);
    });

    _.each(nested, function(value, key, object) {
      var localObj = ObjectUtils.deepOmit(value, blacklist);
      if (!_.isEmpty(localObj)) omitted[key] = localObj;
      else delete omitted[key];
    });

    return omitted;
  },

  /**
   * isPlainObject is a cheap version of $.isPlainObject because importing jquery for
   * a single function is overkill. The only difference in functionality is that
   * this `isObject` fails to return false for an ES6 class created object (which
   * is fine for our current needs).
   *
   * @param {*} obj Anything.
   * @returns {Boolean} true if `obj` is a plain object or ES6 class instantiated
   *    object, false otherwise.
   */
  isPlainObject: function(obj) {
    return _.isObject(obj) && !_.isArray(obj);
  }
};

export default ObjectUtils;
