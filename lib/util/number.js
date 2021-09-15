'use strict'

/**
 * @class util.number
 *
 * Methods for numbers
 */
const accounting = require('accounting')

module.exports = {
  /**
    * Calculate the percent of one value to another
    * @param {Number}  value                    The main value
    * @param {Number}  ofValue                  The value to compare the other value to
    * @param {Boolean} [multiplyByHundred=true] Should the result be multiplied by 100 as convention(e.g 5000 for 50%)
    *
    * @return {Number} The percentage of value in ofValue
    */
  percentOf: function (value, ofValue, multiplyByHundred) {
    return value / ofValue * (multiplyByHundred !== false ? 10000 : 100)
  },

  /**
    * Get the passed value to the passed number of decimal places where necessary
    * so if 2.5000 is passed it will be formatted to 2.5 even if numberOfDecimalPlaces is 5
    *
    * @param {Number} value The number to format
    * @param {Number} [maxDecimalPlaces=2] The max number of decimal places to format to
    *
    * @return {Number} The formatted number
    */
  toDecimalPlaces: function (value, maxDecimalPlaces) {
    return +(value || 0).toFixed(maxDecimalPlaces || 2)
  },

  /**
    * Function converting a number to a money format for displaying
    * purposes.
    *
    * @param  {Number} value                       The number to convert to money format
    * @param  {String} [symbol='']                 The currency symbol to append to the value
    * @param  {Number} [decimalDigits=2]           The decimal digits to show
    * @param  {String} [separator=',']             The value separator
    * @param  {String} [decimalSeparator='.']      The decimal separator
    * @param  {Number} [divisor=100]               The divisor use to convert the value to money format
    * @return {String} The value formatted to a money string format
    */
  numberToMoneyFormat: function (value, symbol, decimalDigits, separator, decimalSeparator, divisor = 100) {
    value = value / divisor
    symbol = symbol || ''
    decimalDigits = decimalDigits || 2
    separator = separator || ','
    decimalSeparator = decimalSeparator || '.'
    return accounting.formatMoney(value, symbol, decimalDigits, ',', '.')
  }
}
