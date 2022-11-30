'use strict'

/**
 * @class util.json
 *
 * Methods for json
 */
const json2Csv = require('json2csv')
const bluebird = require('bluebird')

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
        return !!_.find(values, value => value[field])
      })
    }
    const options = _.merge(
      {
        data: !_.isEmpty(values) ? values : [],
        fields: fields
      },
      extraOptions || {}
    )
    const convert = bluebird.promisify(json2Csv)

    return convert(options)
  }
}
