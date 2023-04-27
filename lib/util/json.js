'use strict'

/**
 * @class util.json
 *
 * Methods for json
 */
const json2Csv = require('json2csv')
const bluebird = require('bluebird')
const numberUtil = require('./number')

module.exports = {
  /**
    * Parse json to csv and return a promise
    * @param  {Object[]} values values
    * @param  {String[]} fields all fields in values
    * @param  {Object}   [extraOptions]  any extra options
    * @param  {Boolean}  [omitEmptyColumns]  True to omit any empty columns (fields with no values)
    *
    * @return {Promise} Resolves with the csv
    */
  convertJsonToCsv: function (values, fields, extraOptions, omitEmptyColumns) {
    if (omitEmptyColumns) {
      fields = _.filter(fields, function (field) {
        return !!_.find(values, (value) => value[field])
      })
    }
    const options = _.merge({
      data: !_.isEmpty(values) ? values : [],
      fields: fields
    }, extraOptions || {})
    const convert = bluebird.promisify(json2Csv)

    return convert(options)
  },

  /**
    * Try parse the passed value as JSON
    *
    * @param {*} value The value to try and parse
    *
    * @return {*} If valid json then that will be returned, otherwise the original value will be returned
    */
  tryParseJSON: function (value) {
    try {
      const json = this.parseJSON(value)
      if (_.isObject(json)) {
        return json
      }
    } catch (err) {
      // Suppress parse error
    }

    return value
  },

  /**
    * Parse value if value was stringified on client, ie.e for GET request
    * @param  {String}  value          The value
    * @param  {Boolean} parseIntegers  True to parse the integers in the json
    *
    * @return {Array|Object} value
    */
  parseJSON: function (value, parseIntegers) {
    if (!_.isString(value)) {
      return value
    }
    try {
      if (parseIntegers && !_.isEmpty(JSON.parse(value))) {
        value = JSON.parse(value, (key, value) => {
          return numberUtil.parseFloatOnlyIfNumberString(value)
        })
      } else {
        value = JSON.parse(value)
      }
    } catch (e) {
      pcsapi.log.error('Error parsing json', e)
      throw new Error(e)
    }

    return value
  }
}
