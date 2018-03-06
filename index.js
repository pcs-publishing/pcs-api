'use strict';

const config = require(`${process.cwd()}/config/local.js`),
    path = require('path'),
    httpServer = require('./lib/http-server'),
    logger = require('./lib/logger'),
    _ = require('@sailshq/lodash'),
    includeAll = require('include-all'),
    connections = require('./lib/connections'),
    bluebird = require('bluebird'),
    moduleLoader = require('./lib/module-loader');

module.exports = {

    initialise: function() {
        global['_'] = _;

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
        };

        pcsapi.log = logger;

        pcsapi.log.debug(`index.js - initialise - Initialised`);

        connections.create();
    },

    load: function() {
        pcsapi.log.debug(`index.js - load - Loading`);

        moduleLoader.load();
        httpServer.createServer();
    }
};