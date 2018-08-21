'use strict'

const config = require(`${process.cwd()}/config/local.js`)
const httpServer = require('./lib/http-server')
const logger = require('./lib/logger')
const _ = require('@sailshq/lodash')
const connections = require('./lib/connections')
const bluebird = require('bluebird')
const moduleLoader = require('./lib/module-loader')

module.exports = {

  initialise: function () {
    console.log(config)

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
      moduleLoader: moduleLoader
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
