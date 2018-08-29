'use strict'

const path = require('path')
const includeAll = require('include-all')
const deepExtend = require('deep-extend')

module.exports = {

  load: function () {
    pcsapi.log.debug(`module-loader.js - load - Loading modules`)

    pcsapi.log.verbose(`module-loader.js - load - Loading services`)

    loadServices(function (err, modules) {
      // Expose services on `sails.services` to provide access even when globals are disabled.
      _.extend(pcsapi.services, modules)

      _.each(pcsapi.services, function (service, identity) {
        var globalId = service.globalId || service.identity || identity
        global[globalId] = service
      })

      pcsapi.log.silly(`module-loader.js - load - Loaded services and exposed globally`)
    })

    pcsapi.log.verbose(`module-loader.js - load - Loading responses`)

    loadResponses(function (err, responseDefs) {
      _.extend(pcsapi.middleware.responses, responseDefs)

      pcsapi.log.silly(`module-loader.js - load - Loaded responses`)
    })

    pcsapi.log.verbose(`module-loader.js - load - Loading models`)

    loadModels(function (err, modelDefs) {
      _.extend(pcsapi.middleware.models, modelDefs)

      _.each(pcsapi.middleware.models, function (model, identity) {
        _.each(model.mixins, (mixinName) => {
          let mixin = _.cloneDeep(pcsapi.middleware.mixins[mixinName])
          if (_.isFunction(mixin)) {
            mixin = mixin(model)
          }
          deepExtend(model, mixin)
        })

        var globalId = model.globalId || model.identity || identity
        global[globalId] = model
      })

      pcsapi.log.silly(`module-loader.js - load - Loaded models`)
    })

    loadControllers(function (err, controllerDefs) {
      _.extend(pcsapi.middleware.controllers, controllerDefs)

      pcsapi.log.silly(`module-loader.js - load - Loaded controllers`)
    })

    function loadServices (cb) {
      loadModulesFromPath(path.resolve(`${process.cwd()}/api/services/`), cb)
    };

    function loadResponses (cb) {
      includeAll.optional({
        dirname: path.resolve(`${__dirname}/../api/responses/`),
        filter: new RegExp('(.+)\\.(' + ['js'].join('|') + ')$'),
        useGlobalIdForKeyName: true
      }, bindToHelper(cb))
    };

    function loadModels (cb) {
      includeAll.optional({
        dirname: path.resolve(`${process.cwd()}/api/models/`),
        filter: new RegExp('(.+)\\.(' + ['js'].join('|') + ')$'),
        useGlobalIdForKeyName: true
      }, bindToHelper(cb))
    };

    function loadControllers (cb) {
      pcsapi.log.verbose(`module-loader.js - load - Loading controllers from ${path.resolve('./api/controllers/')}`)

      includeAll.optional({
        dirname: path.resolve(`${process.cwd()}/api/controllers/`),
        filter: new RegExp('(.+)\\.(' + ['js'].join('|') + ')$'),
        useGlobalIdForKeyName: true
      }, bindToHelper(cb))
    };
  },

  loadServices: function (servicesPath) {
    pcsapi.log.verbose(`module-loader.js - loadServices - Loading services from ${servicesPath}`)

    return loadModulesFromPath(servicesPath, function (err, modules) {
      // Expose services on `sails.services` to provide access even when globals are disabled.
      _.extend(pcsapi.services, modules)

      _.each(pcsapi.services, function (service, identity) {
        var globalId = service.globalId || service.identity || identity
        global[globalId] = service
      })
    })
  },

  loadMixins: function (mixinsPath) {
    pcsapi.log.verbose(`module-loader.js - loadMixins - Loading mixins from ${mixinsPath}`)

    return loadMixinsFromPath(mixinsPath, function (err, modules) {
      _.extend(pcsapi.middleware.mixins, modules)
    })
  }
}

function loadModulesFromPath (servicesPath, cb) {
  includeAll.optional({
    dirname: servicesPath,
    filter: new RegExp('(.+)\\.(' + ['js'].join('|') + ')$'),
    depth: 1,
    caseSensitive: true
  }, bindToHelper(cb))
};

function loadMixinsFromPath (mixinsPath, cb) {
  includeAll.optional({
    dirname: mixinsPath,
    filter: new RegExp('(.+)\\.(' + ['js'].join('|') + ')$'),
    depth: 1,
    caseSensitive: true,
    identity: false
  }, cb)
};

function bindToHelper (cb) {
  return function (err, modules) {
    if (err) {
      return cb(err)
    }
    _.each(modules, function (module) {
      module.pcsapi = pcsapi
      // Bind all methods to the module context
      _.bindAll(module)
    })
    return cb(null, modules)
  }
};
