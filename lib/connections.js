'use strict'

const config = require(`${process.cwd()}/config/local.js`)

module.exports = {
  create: function () {
    pcsapi.log.debug(`connections.js - create - Creating database connections`)

    _.each(config.connections, function (connection, name) {
      const newConnection = require('knex')({
        client: connection.client,
        connection: connection,
        pool: connection.pool,
        acquireConnectionTimeout: 60000
      })

      pcsapi.log.verbose(
        `connections.js - create - Creating ${name} connection`
      )

      pcsapi.connections[name] = newConnection
    })
  }
}
