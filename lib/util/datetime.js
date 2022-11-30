'use strict'

/**
 * @class util.datetime
 *
 * Date/Time utility methods.
 */
const TIME_INTERVAL = {
  YEARS: 'y',
  MONTHS: 'M',
  WEEKS: 'w',
  DAYS: 'd',
  HOURS: 'h',
  MINUTES: 'm',
  SECONDS: 's',
  MILLISECONDS: 'ms'
}
const pcsutils = require('@pcs/utils')
const moment = require('moment')
require('moment-timezone')

module.exports = {
  areDatesTheSame: pcsutils.date.areDatesTheSame,
  isValidDate: pcsutils.date.isValidDate,

  /**
   * Convert a date to a moment object in the passed timezone
   *
   * @param {Date} date The utc date to convert
   * @param {String} [timeZoneName='Europe/London'] The name of the timezone to convert the date to
   *
   * @return {Object} The localised date as a moment object
   */
  convertDateToTimezoneMoment: function (date, timeZoneName = 'Europe/London') {
    date = new Date(date)
    return moment.tz(date, timeZoneName)
  },

  /**
   * Gets the current server date/time
   *
   * @return {Date} A date object with the current server time
   */
  getServerDateTime: function () {
    return new Date()
  },

  /**
   * returns the passed date with the time set to 00:00:00 and applies local time offset if given
   *
   * @param {Date} date The date
   * @param {Number} [timeZoneName] The timezone name
   *
   * @return {Date} The date with its time set to the start of the day, relative to the passed timezone
   */
  startOfDay: function (date, timeZoneName) {
    return this.convertDateToTimezoneMoment(date, timeZoneName)
      .startOf('day')
      .toDate()
  },

  /**
   * returns the passed date with the time set to 23:59:59 and applies local time offset if given
   *
   * @param {Date} date The date
   * @param {Number} [timeZoneName] The timezone name
   *
   * @return {Date} The date with its time set to the end of the day, relative to the passed timezone
   */
  endOfDay: function (date, timeZoneName) {
    return this.convertDateToTimezoneMoment(date, timeZoneName)
      .endOf('day')
      .toDate()
  },

  /**
   * Add years to a passed date
   *
   * @param {Date} A date object
   * @param {Number} number of years
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  addYears: function (date, years, timeZoneName) {
    return this.addTimeInterval(date, TIME_INTERVAL.YEARS, years, timeZoneName)
  },

  /**
   * Subtract years from a passed date
   *
   * @param {Date} A date object
   * @param {Number} number of years
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  subtractYears: function (date, years, timeZoneName) {
    return this.addTimeInterval(date, TIME_INTERVAL.YEARS, -years, timeZoneName)
  },

  /**
   * Add months to a passed date
   *
   * @param {Date} A date object
   * @param {Number} number of months
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  addMonths: function (date, months, timeZoneName) {
    return this.addTimeInterval(
      date,
      TIME_INTERVAL.MONTHS,
      months,
      timeZoneName
    )
  },

  /**
   * Subtract months from a passed date
   *
   * @param {Date} A date object
   * @param {Number} number of months
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  subtractMonths: function (date, months, timeZoneName) {
    return this.addTimeInterval(
      date,
      TIME_INTERVAL.MONTHS,
      -months,
      timeZoneName
    )
  },

  /**
   * Add weeks to a passed date
   *
   * @param {Date} A date object
   * @param {Number} number of weeks
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  addWeeks: function (date, weeks, timeZoneName) {
    return this.addTimeInterval(date, TIME_INTERVAL.WEEKS, weeks, timeZoneName)
  },

  /**
   * Subtract weeks from a passed date
   *
   * @param {Date} A date object
   * @param {Number} number of weeks
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  subtractWeeks: function (date, weeks, timeZoneName) {
    return this.addTimeInterval(date, TIME_INTERVAL.WEEKS, -weeks, timeZoneName)
  },

  /**
   * Add days to a passed date
   *
   * @param {Date} A date object
   * @param {Number} number of days
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  addDays: function (date, days, timeZoneName) {
    return this.addTimeInterval(date, TIME_INTERVAL.DAYS, days, timeZoneName)
  },

  /**
   * Subtract days from a passed date
   *
   * @param {Date} A date object
   * @param {Number} number of days
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  subtractDays: function (date, days, timeZoneName) {
    return this.addTimeInterval(date, TIME_INTERVAL.DAYS, -days, timeZoneName)
  },

  /**
   * Add hours to a passed date
   *
   * @param {Date} date A date object
   * @param {Number} number of hours
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  addHours: function (date, hours, timeZoneName) {
    return this.addTimeInterval(date, TIME_INTERVAL.HOURS, hours, timeZoneName)
  },

  /**
   * Subtract hours from a passed date
   *
   * @param {Date} date A date object
   * @param {Number} number of hours
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  subtractHours: function (date, hours, timeZoneName) {
    return this.addTimeInterval(date, TIME_INTERVAL.HOURS, -hours, timeZoneName)
  },

  /**
   * Add minutes to a passed date
   *
   * @param {Date} date A date object
   * @param {Number} minutes number of minutes
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  addMinutes: function (date, minutes, timeZoneName) {
    return this.addTimeInterval(
      date,
      TIME_INTERVAL.MINUTES,
      minutes,
      timeZoneName
    )
  },

  /**
   * Subtract minutes from a passed date
   *
   * @param {Date} date A date object
   * @param {Number} number of minutes
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  subtractMinutes: function (date, minutes, timeZoneName) {
    return this.addTimeInterval(
      date,
      TIME_INTERVAL.MINUTES,
      -minutes,
      timeZoneName
    )
  },

  /**
   * Add seconds to a passed date
   *
   * @param {Date} date A date object
   * @param {Number} number of seconds
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  addSeconds: function (date, seconds, timeZoneName) {
    return this.addTimeInterval(
      date,
      TIME_INTERVAL.SECONDS,
      seconds,
      timeZoneName
    )
  },

  /**
   * subtract seconds from a passed date
   *
   * @param {Date} date A date object
   * @param {Number} number of seconds
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  subtractSeconds: function (date, seconds, timeZoneName) {
    return this.addTimeInterval(
      date,
      TIME_INTERVAL.SECONDS,
      -seconds,
      timeZoneName
    )
  },

  /**
   * Add milliseconds to a passed date
   *
   * @param {Date} date A date object
   * @param {Number} number of milliseconds
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  addMilliSeconds: function (date, milliseconds, timeZoneName) {
    return this.addTimeInterval(
      date,
      TIME_INTERVAL.MILLISECONDS,
      milliseconds,
      timeZoneName
    )
  },

  /**
   * subtract milliseconds from a passed date
   *
   * @param {Date} date A date object
   * @param {Number} number of milliseconds
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  subtractMilliSeconds: function (date, milliseconds, timeZoneName) {
    return this.addTimeInterval(
      date,
      TIME_INTERVAL.MILLISECONDS,
      -milliseconds,
      timeZoneName
    )
  },

  /**
   * Add a time interval to a passed date
   *
   * @param {Date}   date     A date object
   * @param {Number} interval The interval to add
   * @param {Number} amount   The number of the interval to add
   * @param {String} [timeZoneName]  The timezone name
   *
   * @return {Date} A date object
   */
  addTimeInterval: function (date, interval, amount, timeZoneName) {
    return this.convertDateToTimezoneMoment(date, timeZoneName)
      .add(amount, interval)
      .toDate()
  },

  /**
   * Function formatting the date to the passed in format
   * @param  {Date}   date                      The date to format
   * @param  {String} formatOutput              The desired format output
   * @param  {Number} [timeZone]                The local timezone
   *
   * @return {String}   The formatted date
   */
  formatDate: function (date, formatOutput, timeZone) {
    formatOutput = formatOutput || 'D/M/Y'
    return this.convertDateToTimezoneMoment(date, timeZone).format(formatOutput)
  },

  /**
   * Format the passed date for a raw knex query
   * @param {Date|String|Object} date The date to format
   *
   * @return {String} The passed date for a raw knex query
   */
  getDateFormattedForKnexRaw: function (date) {
    return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ssZZ')
  },

  /**
   * Returns the time intervals of the date passed
   * @param {Date} The date to get date intervals for
   *
   * @return {Object} An object of intervals with appropriate key names
   */
  getIntervalsFromDate: function (date) {
    const mDate = moment(new Date(date))

    return {
      year: mDate.year(),
      quarter: mDate.quarter(),
      month: mDate.month(),
      week: mDate.isoWeek(),
      monthDay: mDate.date(),
      day: mDate.day(),
      hour: mDate.hour(),
      minute: mDate.minute()
    }
  },

  /**
   * Calculate the number of weeks covered between startDate and endDate
   *
   * @param {Date} startDate Start date
   * @param {Date} endDate End date
   *
   * @return {Number} Number of weeks covered by the specified period
   */
  weeksBetween: function (startDate, endDate) {
    return this.timeBetween(startDate, endDate, 'weeks')
  },

  /**
   * Calculate the number of days covered between startDate and endDate
   *
   * @param {Date} startDate Start date
   * @param {Date} endDate End date
   *
   * @return {Number} Number of days covered by the specified period
   */
  daysBetween: function (startDate, endDate) {
    return this.timeBetween(startDate, endDate, 'days')
  },

  /**
   * Calculate the number of milliseconds between startDate and endDate
   *
   * @param {Date} startDate Start date
   * @param {Date} endDate End date
   *
   * @return {Number} Number of milliseconds covered by the specified period
   */
  msBetween: function (startDate, endDate) {
    return this.timeBetween(startDate, endDate)
  },

  /**
   * Calculate the time between startDate and endDate in the given units
   *
   * @param {Date}   startDate   Start date
   * @param {Date}   endDate     End date
   * @param {String} units       The units to use
   *
   * @return {Number} Number of milliseconds covered by the specified period
   */
  timeBetween: function (startDate, endDate, units) {
    const startMoment = moment(new Date(startDate))
    const endMoment = moment(new Date(endDate))

    return endMoment.diff(startMoment, units)
  },

  /**
   * Determine if one date is after another
   *
   * @param {Date} firstDate first date
   * @param {Date} secondDate Second date
   * @param {String|undefined} unit date unit
   *
   * @return {Boolean} Is the first date after the second date?
   */
  isAfter: function (firstDate, secondDate, unit) {
    const firstMoment = moment(new Date(firstDate))
    const secondMoment = moment(new Date(secondDate))

    return firstMoment.isAfter(secondMoment, unit)
  },

  /**
   * Determine if one date is the same or after another
   *
   * @param {Date} firstDate first date
   * @param {Date} secondDate Second date
   * @param {String|undefined} unit date unit
   *
   * @return {Boolean} Is the first date the same or after the second date?
   */
  isSameOrAfter: function (firstDate, secondDate, unit) {
    const firstMoment = moment(new Date(firstDate))
    const secondMoment = moment(new Date(secondDate))

    return firstMoment.isSameOrAfter(secondMoment, unit)
  }
}
