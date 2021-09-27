'use strict'

/**
 * @class util.object
 *
 * Methods for objects
 */
const arrayUtil = require('./array')
const datetimeUtil = require('./datetime')

module.exports = {
  /**
   * Replace nulls with value
   *
   * @param {Object} obj The object to replace the nulls in
   * @param {*} replaceWith The value to replace all nulls with
   *
   * @return {Object} The objects with the nulls replaced
   */
  replaceNullsWithValue: function (obj, replaceWith) {
    const workingOn = _.clone(obj)

    _.forIn(workingOn, (value, key) => {
      if (value === null) {
        workingOn[key] = replaceWith
      }
    })

    return workingOn
  },

  /**
   * Compact method for an object, removes all falsy values, including zeroes if removeFalsy is true
   *
   * @param  {Object}  obj             The object to change
   * @param  {Boolean} [removeFalsy]   Whether to remove all falsy properties (including zeroes)
   * @param  {Boolean} [removeEmpty]   Whether to remove empty object/arrays
   *
   * @return {Object} The object without falsy values
   */
  compact: function (obj, removeFalsy, removeEmpty) {
    var newObj = _.clone(obj)

    _.each(
      newObj,
      function (value, key) {
        if (!value && (removeFalsy || !(value === 0 || value === false))) {
          delete newObj[key]
        }

        if (_.isDate(value) && datetimeUtil.isValidDate(value)) {
          return
        }

        if (_.isArray(value)) {
          value = arrayUtil.compact(value)
          if (_.isEmpty(value)) {
            delete newObj[key]
          }
        }

        if (removeEmpty && _.isObject(value)) {
          value = this.compact(value, true, true)
          if (_.isEmpty(value)) {
            delete newObj[key]
          }
        }
      },
      this
    )

    return newObj
  },

  /**
   * Gets a value from an object at a specified path
   *
   * @param {Object} object object to get value from
   * @param {String} path where to get value
   *
   * @return {*} value from object at specifed path
   */
  getValueAt: function (object, path) {
    const properties = path.split('.')
    let currentValue = _.clone(object || {})

    _.each(properties, property => {
      if (_.isArray(currentValue)) {
        currentValue = _.head(currentValue)
      }
      if (currentValue && currentValue.hasOwnProperty(property)) {
        currentValue = currentValue[property]
      } else {
        currentValue = null
        return false
      }
    })

    return currentValue
  },

  /**
   * Replace null and undefined attributes of object with value
   * @param {Object} obj           The object
   * @param {*}      replaceWith   The value to replace with
   *
   * @return {Object} The object with the defaults applied
   */
  replaceNullAndUndefinedValues: function (obj, replaceWith) {
    const clonedObj = _.clone(obj)

    _.forIn(clonedObj, (value, key) => {
      if (_.contains([undefined, null], value)) {
        clonedObj[key] = replaceWith
      }
    })

    return clonedObj
  }
}
