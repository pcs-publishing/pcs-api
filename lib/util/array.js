'use strict'

/**
 * @class util.array
 *
 * Methods for arrays
 */
const objectUtil = require('./object')
const valueUtil = require('./value')

module.exports = {

  /**
    * Returns an array of int or float from an array of number strings
    * @param {String[]} array   The array of strings
    * @param {Boolean}  [isFloat] True if array of floats
    *
    * @return {Number[]} The array of parsed integers or float
    */
  parseNumberArray: function (array, isFloat) {
    return _.map(array, function (arrayItem) {
      return isFloat ? parseFloat(arrayItem) : parseInt(arrayItem, 10)
    })
  },

  /**
    * Returns an array of negativised integers or floats
    * @param {String[]|Number[]} array   The array
    * @param {Boolean}  [isFloat] True if array of floats
    *
    * @return {Number[]} The array of parsed integers or float
    */
  negativiseArray: function (array, isFloat) {
    const firstElement = array[0]

    if (!firstElement) {
      return []
    }
    if (_.isString(firstElement)) {
      array = this.parseNumberArray(array, isFloat)
    }

    return _.map(array, function (arrayItem) {
      return -Math.abs(arrayItem)
    })
  },

  /**
    * Applies an attribute to an array of objects
    * @param {Object[]} array     The array
    * @param {String}   attribute The attribute to apply
    * @param {*}        value     The value of the attribute
    *
    * @return {Number[]} The array of parsed integers or float
    */
  applyAttributeToArrayOfObjects: function (array, attribute, value) {
    return _.map(array, function (arrayItem) {
      return {
        ...arrayItem,
        [attribute]: value
      }
    })
  },

  /**
    * Get uniq values in an array either a path to a property or a function that returns the value to do unique by
    *
    * @param {Array}           array                 The array to filter to the unique values
    * @param {String|Function} handler               The name of the property on each array item to use to identify that item, can also be a path to a property many levels down. Or a function that returns the value that we should be checking unique by
    * @param {Boolean}         [mergeNestedArrays]   True to merge any nested arrays from non-unique objects into the unique object returned
    *
    * @return {Array} The unique array
    */
  uniqueBy: function (array, handler, mergeNestedArrays) {
    const uniqueValuesFound = []

    return _.filter(array, function (item, index) {
      const valueOfUniqueProperty = _.isString(handler) ? objectUtil.getValueAt(item, handler) : handler(item, index, array)

      if (!valueUtil.hasValue(valueOfUniqueProperty) || _.includes(uniqueValuesFound, valueOfUniqueProperty)) {
        if (mergeNestedArrays) {
          const arrayKeys = array.compactMap(item, function (value, key) {
            if (_.isArray(value)) {
              return key
            }
          })

          if (!_.isEmpty(arrayKeys)) {
            const uniqueObject = _.find(array, function (arrayItem) {
              const uniqueObjectValue = _.isString(handler) ? objectUtil.getValueAt(arrayItem, handler) : handler(arrayItem, index, array)

              return uniqueObjectValue === valueOfUniqueProperty
            })

            _.each(arrayKeys, function (key) {
              const uniqueObjectValue = uniqueObject[key] || []

              uniqueObject[key] = uniqueObjectValue.concat(item[key])
              uniqueObject[key] = _.isObject(uniqueObject[key][0]) ? array.uniqueBy(uniqueObject[key], handler) : _.unique(uniqueObject[key])
            }, this)
          }
        }
        return false
      }

      uniqueValuesFound.push(valueOfUniqueProperty)
      return true
    }, this)
  },

  /**
    * Filters the falsy values of an array (including empty objects and arrays)
    *
    * @param  {Array}  array              array of record
    *
    * @return {Array}  compacted array
    */
  compact: function (array) {
    const arrayToCompact = _.clone(array)

    return this.compactMap(arrayToCompact, function (arrayElement) {
      const isObject = _.isObject(arrayElement)

      if (isObject) {
        arrayElement = objectUtil.compact(arrayElement, false, true)
      }
      if (arrayElement && (!isObject || !_.isEmpty(arrayElement))) {
        return arrayElement
      }
    })
  },

  /**
    * Apply map to array and filter out all null or undefined values from said array
    *
    * @param {Object[]}        arr       The array to map
    * @param {Function|String} mapping   The mapping
    * @param {Object}          [scope]   The scope
    *
    * @return {Array} The resulting array with null and undefined removed
    */
  compactMap: function (arr, mapping, scope) {
    if (_.isEmpty(arr)) {
      return []
    }
    const returnResult = _.map(arr, mapping, scope)

    return _.filter(returnResult, function (value) {
      return valueUtil.hasValue(value)
    })
  },

  /**
    * Should perform a pluck, pulling out a value from a specified path
    *
    * @param {Array} arr The array to perform the cleanPluck
    * @param {String} path path of property to pluck
    *
    * @return {Array} array of the plucked values
    */
  pluckDeep: function (array, path) {
    return _.map(array, item => objectUtil.getValueAt(item, path))
  }
}
