'use strict'

/**
 * @class util.param
 *
 * Util for getting parameters out of requests
 */
const moment = require('moment')

module.exports = (function () {
  /**
    * Get number from parameter
    * @param {Object} req The request
    * @param {String} paramName The parameter name
    * @param {Function} parseFn The function to use to parse the number
    * @param {Boolean} [required = false] Whether the parameter is required
    * @param {String} [error = 'API_MISSING_PARAM'] Custom error to throw if required = true and nothing valid has been passed in
    *
    * @return {Number|null} The parsed number (or null if not required)
    */
  const getNumberFromParam = function (req, paramName, parseFn, required, error) {
    let param = this.param(req, paramName)

    if (_.isObject(param)) {
      errorHandling(required, error)
      return null
    }
    param = parseFn(param, 10)

    if (isNaN(param)) {
      errorHandling(required, error)
      return null
    }
    return param
  }

  /**
   * Get date from param, if not a valid date return null
   *
   * @param {Object} req The request
   * @param {String} paramName The parameter name
   *
   * @return {Date|null} The date or null if invalid
   */
  const getDateParam = function (req, paramName) {
    const param = req.param(paramName)

    if (!param || (!_.isDate(param) && !_.isString(param))) {
      return null
    }

    let date = new Date(param)
    if (!isValidDate(date)) {
      return null
    }

    return date
  }

  /**
    * Error handler, if required throw error
    * @param {Boolean} required If true throw the erro
    * @param {String} [error='API_MISSING_PARAM'] The name of the error to throw
    *
    */
  const errorHandling = function (required, error = 'API_MISSING_PARAM') {
    if (required === true) {
      throw new Error(error)
    }
  }

  // Public functions
  return {
    /**
      * Get int from param
      * @param {Object} req The request
      * @param {String} paramName The parameter name
      * @param {Boolean} [required = false] Whether the parameter is required
      * @param {String} [error = 'API_MISSING_PARAM'] Custom error to throw if required = true and nothing valid has been passed in
      *
      * @return {Number|null} The parameter as a number, if not found returns null
      */
    getIntFromParam: function (req, paramName, required, error) {
      return getNumberFromParam(req, paramName, parseInt, required, error)
    },

    /**
      * Get param from req object
      * @param {Object} req The request
      * @param {String} paramName The parameter name
      *
      * @return {*} The parameter
      */
    param: function (req, paramName) {
      let param = req.params ? req.params[paramName] : undefined

      if (!param) {
        param = req.body ? req.body[paramName] : undefined
      }

      if (!param) {
        param = req.query ? req.query[paramName] : undefined
      }

      return param
    },

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

    /**
      * Get boolean from request param
      * @param {Object} req The request
      * @param {String} paramName The parameter name
      * @param {Boolean} [required = false] Whether the parameter is required
      * @param {String} [error = 'API_MISSING_PARAM'] Custom error to throw if required = true and nothing valid has been passed in
      *
      * @return {Boolean} The parameter as a boolean
      */
    getBooleanFromParam: function (req, paramName, required, error) {
      let param = this.param(req, paramName)

      if (!param) {
        errorHandling(required, error)
        return false
      }

      if (_.isString(param)) {
        return param.toUpperCase() === 'TRUE'
      }

      return true
    },

    /**
      * Get string from param
      * @param {Object} req The request to get the param from
      * @param {String} paramName The parameter name
      * @param {Boolean} [required = false] Whether the parameter is required
      * @param {String} [error = 'API_MISSING_PARAM'] Custom error to throw if required = true and nothing valid has been passed in
      *
      * @return {String|null} The string extracted from the param
      */
    getStringFromParam: function (req, paramName, required, error) {
      const param = this.param(req, paramName)

      if (hasValue(param) && !_.isObject(param) && _.isFunction(param.toString)) {
        return param.toString()
      }

      errorHandling(required, error)

      return ''
    },

    /**
      * Get array from request parameter
      * @param {Object} req The request
      * @param {String} paramName The parameter name
      * @param {Boolean} [required = false] Whether the parameter is required
      * @param {String} [error = 'API_MISSING_PARAM'] Custom error to throw if required = true and nothing valid has been passed in
      *
      * @return {Array} The array from the parameter
      */
    getArrayFromParam: function (req, paramName, required, error) {
      let param = this.param(req, paramName)

      if (!param) {
        errorHandling(required, error)
        return []
      }

      if (!_.isArray(param)) {
        param = [param]
      }
      return param
    },

    /**
      * Get array of integers from param
      *
      * @param {Object} req The request
      * @param {String} paramName The name of the param to extract from the req
      * @param {Boolean} [required = false] Whether the parameter is required
      * @param {String} [error = 'API_MISSING_PARAM'] Custom error to throw if required = true and nothing valid has been passed in
      *
      * @return {Number[]} The int array extracted from the parameter
      */
    getIntArrayFromParam: function (req, paramName, required, error) {
      const arrayOfIntParams = _.map(this.getArrayFromParam(req, paramName, required, error), (val) => {
        if (val && _.isFunction(val.replace)) {
          val = val.replace('\'', '')
        }

        val = parseInt(val, 10)

        if (!isNaN(val)) {
          return val
        }
      })

      return _.without(arrayOfIntParams, false, null, '', undefined, NaN)
    },

    /**
      * Get json from param
      * @param {Object} req The request
      * @param {String} [paramName] The parameter name, if not passed will parse req.body
      * @param {Boolean} [required = false] Whether the parameter is required
      * @param {String} [error = 'API_MISSING_PARAM'] Custom error to throw if required = true and nothing valid has been passed in
      *
      * @return {Object|Array|null} The parsed json
      */
    getJsonFromParam: function (req, paramName, required, error) {
      let value

      if (paramName) {
        value = this.param(req, paramName)
      } else {
        value = req.body
      }

      try {
        if (!required && !hasValue(value)) {
          return null
        }
        if (_.isString(value)) {
          return parseJSON(value)
        } else if (_.isArray(value)) {
          return _.map(value, parseJSON)
        } else {
          return value
        }
      } catch (err) {
        pcsapi.log.error('UtilsParamService.getJsonFromParam', 'Failed to parse json parameter')
        errorHandling(required, error)
        return null
      }
    },

    /**
      * Get date from param, handles validation errors
      *
      * @param {Object} req The request
      * @param {String} paramName The parameter name
      * @param {Boolean} [required] True if required
      * @param {String}  [error]     Error to throw
      *
      * @return {Date|null} The date or null if invalid
      */
    getDateFromParam: function (req, paramName, required, error) {
      const date = getDateParam(req, paramName)

      if (!date) {
        errorHandling(required, paramName, error)
        return null
      }

      return date
    },

    /**
     * Get nullable boolean from param, will return null
     * if the param result is not a boolean and not 'true' or
     * 'false' as a string
     *
     * @param {Object} req The request
     * @param {String} paramName The parameter name
     *
     * @return {Boolean|null} The parameter as a boolean or null if not a valid boolean value
     */
    getNullableBooleanFromParam: function (req, paramName) {
      let param = req.param(paramName)
      if (_.isBoolean(param)) {
        return param
      }

      if (_.isString(param)) {
        param = param.toUpperCase()
        if (param === 'TRUE') {
          return true
        }
        if (param === 'FALSE') {
          return false
        }
      }

      return null
    }
  }
})()

/**
 * Parse value if value was stringified on client, i.e. for GET request
 * @param  {String} value value
 *
 * @return {Array|Object} value
 */
function parseJSON (value) {
  if (_.isString(value)) {
    try {
      value = JSON.parse(value)
    } catch (e) {
      pcsapi.log.error('json', 'Error parsing json', e)
      throw new Error('API_NOT_PARSABLE')
    }
  }

  return value
}

/**
 * Function that checks if that passed in value has a value
 * @param  {*}  value  the passed in value to be checked
 *
 * @return {Boolean}  returns true if the value has value
 */
function hasValue (value) {
  if (_.isObject(value)) {
    return _.isDate(value) ? isValidDate(value) : !_.isEmpty(value)
  }

  if (value === 0 || value === false) {
    return true
  }

  return !!value
}

/**
 * Is valid date
 * @param {Date} The date to check for validity
 *
 * @return {Boolean} Is the passed in date a valid date
 */
function isValidDate (date) {
  if (!_.isDate(date)) {
    return false
  }
  return moment(new Date(date)).isValid()
}
