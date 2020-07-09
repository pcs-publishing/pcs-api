'use strict'

module.exports = {
  /**
    * Create new record(s)
    * @param {String}          connection The connection
    * @param {String}          tableName  The table name
    * @param {Object|Object[]} data       The data to create
    *
    * @return {Object|Object[]} The created object(s)
    */
  create: async function (connection, tableName, data) {
    const createdRecords = await pcsapi.connections[connection](tableName).insert(data).returning('*')
    const isSingleCreate = createdRecords.length === 1

    return isSingleCreate ? _.first(createdRecords) : createdRecords
  },

  /**
    * Update record(s)
    * @param {String}          connection The connection
    * @param {String}          tableName  The table name
    * @param {Number|Object}   filter     The filter for the records to update
    * @param {Object}          data       The data to update
    *
    * @return {Object|Object[]} The updated object(s)
    */
  update: async function (connection, tableName, filter, data) {
    const updatedRecords = await pcsapi.connections[connection](tableName).where(filter).update(data).returning('*')
    const isSingleUpdate = updatedRecords.length === 1

    return isSingleUpdate ? _.first(updatedRecords) : updatedRecords
  }
}
