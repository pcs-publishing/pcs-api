'use strict'

/**
 * @class util.string
 *
 * Methods for strings
 */
module.exports = {
  /**
   * Uniqify a given string list
   * @param {String} stringList   The string list
   * @param {String} separator    The separator in the string list
   *
   * @return {String} The uniqified string list
   */
  uniqifyStringList: function (stringList, separator) {
    return _.uniq(stringList.split(separator)).join(separator)
  }
}
