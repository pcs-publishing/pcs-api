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
  },

  /**
    * Find one record
    * @param {String}          connection The connection
    * @param {String}          tableName  The table name
    * @param {Number|Object}   filter     The filter for the record to find
    *
    * @return {Object} The found object
    */
  findOne: async function (connection, tableName, filter) {
    const recordsFound = await this.find(connection, tableName, filter)

    return _.first(recordsFound)
  },

  /**
    * Find record(s)
    * @param {String}          connection The connection
    * @param {String}          tableName  The table name
    * @param {Number|Object}   filter     The filter for the records to find
    *
    * @return {Object|Object[]} The found object(s)
    */
  find: function (connection, tableName, filter) {
    return pcsapi.connections[connection](tableName).where(filter).select('*')
  }
}
