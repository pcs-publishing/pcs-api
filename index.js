'use strict'

const httpServer = require('./lib/http-server')
const logger = require('./lib/logger')
const _ = require('@sailshq/lodash')
const connections = require('./lib/connections')
const bluebird = require('bluebird')
const moduleLoader = require('./lib/module-loader')
const crud = require('./lib/crud')

module.exports = {

  /**
    * Initialise the api
    * @param  {Boolean} [noConnections=false] True to not set up any connections
    *
    */
  initialise: function (noConnections = false) {
    global['_'] = _

    global['pcsapi'] = {
      Promise: bluebird,
      services: {},
      middleware: {
        controllers: {},
        models: {},
        responses: {},
        mixins: {}
      },
      connections: {},
      moduleLoader: moduleLoader,
      crud: !noConnections ? crud : {}
    }

    pcsapi.log = logger

    pcsapi.log.debug(`index.js - initialise - Initialised`)

    if (!noConnections) {
      connections.create()
    }
  },

  /**
    * Load the api
    * @param  {Function} [callback] The callback function
    *
    */
  load: function (callback) {
    pcsapi.log.debug(`index.js - load - Loading`)

    moduleLoader.load()
    httpServer.createServer(callback)
  }
}
