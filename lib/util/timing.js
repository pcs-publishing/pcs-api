'use strict'

/**
 * @class util.timing
 *
 * Methods for timing code sections for performance debugging.
 */
const startTimes = []
const moment = require('moment')

module.exports = {
  /**
   * Start / reset the timer for the specified key
   * @param {string} key The reference to the individual timer
   *
   */
  start: function (key) {
    startTimes[key] = new Date()
  },

  /**
   * Log out message with the elapsed time for the specified key
   * @param {string} key The reference to the individual timer
   * @param {string} [legend] Text to output along with message
   * @param {boolean} debug Force output to debug level
   *
   */
  elapsed: function (key, legend, debug) {
    const logInfo = `${key} - ${legend} - Timing: ${this.getElapsed(key)}ms`

    if (!debug) {
      pcsapi.log.info(logInfo)
    } else {
      pcsapi.log.debug(logInfo)
    }
  },

  /**
   * get the elapsed time for the specified key
   * @param {string} key The reference to the individual timer
   *
   */
  getElapsed: function (key) {
    return msBetween(startTimes[key], new Date())
  }
}

/**
 * Calculate the number of milliseconds between startDate and endDate
 * @param {Date} startDate Start date
 * @param {Date} endDate End date
 *
 * @return {Number} Number of milliseconds covered by the specified period
 */
function msBetween(startDate, endDate) {
  const startMoment = moment(new Date(startDate))
  const endMoment = moment(new Date(endDate))

  return endMoment.diff(startMoment)
}
