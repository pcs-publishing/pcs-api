'use strict'

/**
 * @class util.param
 *
 * Util for getting parameters out of requests
 */
const pcsutils = require('@pcs/utils')

module.exports = {
  getArrayFromParam: getParamGetter(pcsutils.param.getArray),
  getIntArrayFromParam: getParamGetter(pcsutils.param.getIntArray),
  getBooleanFromParam: getParamGetter(pcsutils.param.getBoolean),
  getNullableBooleanFromParam: getParamGetter(pcsutils.param.getBoolean, { nullable: true }),
  getIntFromParam: getParamGetter(pcsutils.param.getInteger),
  getFloatFromParam: getParamGetter(pcsutils.param.getFloat),
  getDateFromParam: getParamGetter(pcsutils.param.getDate),
  getStartOfDayDateFromParam: getParamGetter(pcsutils.param.getDate, { startOf: 'day' }),
  getEndOfDayDateFromParam: getParamGetter(pcsutils.param.getDate, { endOf: 'day' }),
  getJsonFromParam: getParamGetter(pcsutils.param.getJson),
  getCommaSeparatedArrayFromParam: getParamGetter(pcsutils.param.getCommaSeparatedArray),
  getStringFromParam: getParamGetter(pcsutils.param.getString),
  getStartOfToday,

  /**
    * Get user id from req headers
    * @param {Object} req The request
    *
    * @return {Number} The user id
    */
  getUserFromHeaders (req) {
    let userId = req.headers['user_id']

    if (_.isString(userId)) {
      userId = parseInt(userId, 10)
    }

    return userId
  },

  param: getParam
}

/**
  * Get param from req object
  * @param {Object} req The request
  * @param {String} paramName The parameter name
  *
  * @return {*} The parameter
  */
function getParam (req, paramName) {
  let param = req.params ? req.params[paramName] : undefined

  if (!param) {
    param = req.body ? req.body[paramName] : undefined
  }
  if (!param) {
    param = req.query ? req.query[paramName] : undefined
  }
  return param
}

/**
 * Get a wrapped param function with forced options
 *
 * @param {Function} fn The function to use to get the parameter
 * @param {Object} [forcedOptions={}] The forced options to apply
 *
 * @return {Function} Returns a wrapped function that used the forced options
 */
function getParamGetter (fn, forcedOptions = {}) {
  return (req, param, required, errorCode) => {
    req.body = !_.isEmpty(req.query) ? req.query : req.body
    const options = getOptions({ req, required, errorCode, forcedOptions })
    return fn(req, param, options)
  }
}

/**
 * Get the full options for a param getter function
 *
 * @param {Object} params The function params
 * @param {Object} params.req The request that the param will be taken from
 * @param {Boolean} [params.required=false] Whether the parameter should be required
 * @param {String} [errorCode='API_MISSING_PARAM'] The error code of the error that should be thrown if the required rule is broken
 * @param {Object} [forcedOptions={}] The options to force
 *
 * @return {Object} The full options for a param getter function
 */
function getOptions ({ req, required = false, errorCode = 'API_MISSING_PARAM', forcedOptions = {} }) {
  const options = {
    required: !!required,
    timezone: getTimezone(req)
  }

  return { ...options, ...forcedOptions }
}

/**
 * Get the start of today from the passed request
 *
 * @param {Object} req The request to get the start of the day from
 *
 * @return {Date} The start of today as a date
 */
function getStartOfToday (req) {
  const date = pcsapi.util.datetime.getServerDateTime()
  return pcsutils.date.getLocalisedMomentDate(date, getTimezone(req)).startOf('day').toDate()
}

/**
 * Get the timezone name from the passed request
 *
 * @param {Object} req The request to get the timezone name from
 *
 * @return {String} The name of the timezone for the request
 */
function getTimezone (req) {
  return req.headers['knowledgeprospect-local-timezone'] || 'Europe/London'
}
