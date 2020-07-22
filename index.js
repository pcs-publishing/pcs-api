'use strict'

const httpServer = require('./lib/http-server')
const logger = require('./lib/logger')
const _ = require('@sailshq/lodash')
const connections = require('./lib/connections')
const bluebird = require('bluebird')
const moduleLoader = require('./lib/module-loader')
const crud = require('./lib/crud')

module.exports = {

  initialise: function () {
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
      crud: crud
    }

    pcsapi.log = logger

    pcsapi.log.debug(`index.js - initialise - Initialised`)

    connections.create()
  },

  load: function () {
    pcsapi.log.debug(`index.js - load - Loading`)

    moduleLoader.load()
    httpServer.createServer()
  }
}
