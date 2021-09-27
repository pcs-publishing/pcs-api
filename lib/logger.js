'use strict'

const winston = require('winston')
const config = require(`${process.cwd()}/config/local.js`)

winston.remove(winston.transports.Console)

winston.add(winston.transports.Console, {
  level: config.log.level,
  handleExceptions: true,
  colorize: true
})

module.exports = {
  log: function (msg, level) {
    if (!level) {
      level = 'info'
    }

    winston.log(level, msg)
  },

  error: function (msg, errorObject) {
    if (errorObject) {
      msg = msg += ' - ' + getReadableError(errorObject)
    }

    this.log(msg, 'error')
  },

  warn: function (msg) {
    this.log(msg, 'warn')
  },

  debug: function (msg) {
    this.log(msg, 'debug')
  },

  info: function (msg) {
    this.log(msg, 'info')
  },

  verbose: function (msg) {
    this.log(msg, 'verbose')
  },

  silly: function (msg) {
    this.log(msg, 'silly')
  }
}

/**
 * Return a readable error from the passed in object
 *
 * @param {Error} theObject The object to extract a readable error message from.
 * @return {string} The readable error message.
 *
 */
function getReadableError(object) {
  'use strict'

  if (object.error && object.error.length > 0) {
    return object.error
  } else if (object.error && object.error.message) {
    if (object.error.code) {
      return object.error.code + ': ' + object.error.message
    } else {
      return object.error.message
    }
  } else if (object.statusCode) {
    if (object.statusCode === 500) {
      return '(' + object.statusCode + ') Internal Server Error'
    }
  } else if (object instanceof Error) {
    return `${object.message}\n${object.stack}`
  } else {
    return 'Unknown Error'
  }
}
