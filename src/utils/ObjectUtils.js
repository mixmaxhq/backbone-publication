import _ from 'underscore';
import isPlainObject from './object/isPlainObject';

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
      if (_.has(target, key) && isPlainObject(target[key]) && isPlainObject(source[key])) {
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
    var nested = _.pick(fields, isPlainObject);

    _.each(nested, function(value, key) {
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
    var nested = _.pick(fields, isPlainObject);

    _.each(nested, function(value, key) {
      var localObj = ObjectUtils.deepOmit(value, blacklist);
      if (!_.isEmpty(localObj)) omitted[key] = localObj;
      else delete omitted[key];
    });

    return omitted;
  },

  /**
   * Proxy the isPlainObject for convenience.
   *
   * @param {*} obj Anything.
   * @returns {Boolean} true if `obj` is a plain object
   */
  isPlainObject: isPlainObject,

  /**
   * Performs a deep clone of an object.
   * @param {Object} source - the object to clone.
   * @returns {Object} a clone of the given object, where any descendent objects are themselves
   * cloned, and not just references to their respective counterpart in `source`.
   */
  deepClone: function(source) {
    var clone = _.clone(source);
    _.each(clone, (v,k) => {
      if (_.isObject(v)) {
        clone[k] = ObjectUtils.deepClone(v);
      }
    });
    return clone;
  },

  /**
   * Returns the changes between two objects. Includes attributes in `b` that are not in `a`, and
   * attributes that are in both `a` and `b` but where the values differ. Performs deep comparison
   * of objects and arrays.
   * @param {Object} a - the source object.
   * @param {Object} b - the comparison object.
   * @returns {Object} an object containing the attributes of `b` which differ from `a`.
   */
  changes: function(a, b) {
    const toReturn = {};
    _.each(b, (v,k) => {
      if (!_.has(a, k) || !_.isEqual(a[k], v)) toReturn[k] = v;
    });

    return toReturn;
  }
};

export default ObjectUtils;
