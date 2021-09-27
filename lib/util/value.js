'use strict'

/**
 * @class util.value
 *
 * Methods for values
 */
const datetimeUtil = require('./datetime')

module.exports = {
  /**
   * Function that checks if that passed in value has a value
   * @param  {*}  value  the passed in value to be checked
   *
   * @return {Boolean}  returns true if the value has value
   */
  hasValue: function (value) {
    if (_.isObject(value)) {
      return _.isDate(value)
        ? datetimeUtil.isValidDate(value)
        : !_.isEmpty(value)
    }

    if (value === 0 || value === false) {
      return true
    }

    return !!value
  }
}
