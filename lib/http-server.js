'use strict'

const config = require(`${process.cwd()}/config/local.js`)
let portNumber = config.port

module.exports = {
  /**
    * Create the HTTP server with GET & POST-able routes
    * @param  {Function} [callback] The callback function
    *
    */
  createServer: function (callback) {
    const express = require('express')
    const app = express()
    const bodyParser = require('body-parser')

    app.use(bodyParser.json({
      limit: '50mb'
    }))
    app.use(bodyParser.urlencoded({
      limit: '50mb',
      extended: true
    }))
    pcsapi.log.debug(`http-server.js - createServer - Creating express http server on port ${portNumber}`)

    _.each(pcsapi.middleware.controllers, function eachMethod (controller, name) {
      const functions = Object.getOwnPropertyNames(controller).filter(function (p) {
        return typeof controller[p] === 'function'
      })

      _.each(functions, function (fn) {
        let controllerRoute = controller.identity.substring(0, controller.identity.indexOf('controller'))

        pcsapi.log.verbose(`http-server.js - createServer - Creating get route /${controllerRoute}/${fn}`)

        app.get(`/${controllerRoute}/${fn}`, function (req, res) {
          callControllerMethodWithRequestResponse(req, res, controller, controllerRoute, fn)
        })

        pcsapi.log.verbose(`http-server.js - createServer - Creating post route /${controllerRoute}/${fn}`)

        app.post(`/${controllerRoute}/${fn}`, function (req, res) {
          callControllerMethodWithRequestResponse(req, res, controller, controllerRoute, fn)
        })
      })
    })

    app.listen(portNumber)

    pcsapi.log.info(`http-server.js - createServer - Listening on port ${portNumber}. Node version ${process.version}`)
    if (_.isFunction(callback)) {
      callback(app)
    }
  }
}

/**
  * Call the function on the controller with the req and res objects
  * @param {Object}   req                The request object
  * @param {Object}   res                The response object
  * @param {Object}   controller         The controller
  * @param {String}   controllerRoute    The controller route called
  * @param {Function} fn                 The controller route function
  *
  */
function callControllerMethodWithRequestResponse (req, res, controller, controllerRoute, fn) {
  pcsapi.log.verbose(`http-server.js - createServer - Received request to route /${controllerRoute}/${fn}`)

  _.each(pcsapi.middleware.responses, function eachMethod (responseFn, name) {
    pcsapi.log.silly(`http-server.js - createServer - Adding ${name} response to route /${controllerRoute}/${fn}`)

    res[name] = responseFn.bind({
      req: req,
      res: res
    })
  })

  pcsapi.log.silly(`http-server.js - createServer - Adding jsonx to route /${controllerRoute}/${fn}`)

  res.jsonx = function jsonx (data) {
    if (_.isUndefined(data)) {
      return res.status(res.statusCode).send()
    } else if (typeof data !== 'object') {
      // (note that this guard includes arrays)
      return res.send(data)
    }

    return res.json(data)
  }

  pcsapi.log.verbose(`http-server.js - createServer - Calling ${controller.identity}.${fn}`)

  controller[fn](req, res)
}
