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
    const updatedRecords = await findRecords(connection, tableName, filter, {
      noSelects: true,
      modifyFn: function (query) {
        query.update(data).returning('*')
      }
    })
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
    return findRecords(connection, tableName, filter, { findOne: true })
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
    return findRecords(connection, tableName, filter)
  }
}

/**
 * Find records by a given object/array
 * @param {String}          connection                   The connection
 * @param {String}          tableName                    The table name
 * @param {Number|Object}   filter                       The filter for the records to find
 * @param {Boolean}         [options.findOne=false]      True to only find one record
 * @param {Boolean}         [options.noSelects=false]    True to omit select clause
 * @param {Function}        [options.modifyFn]           Function to modify the query
 *
 * @return {Promise} That resolves with the query with filters applied
 */
async function findRecords (connection, tableName, filter, { findOne = false, noSelects = false, modifyFn } = {}) {
  const query = pcsapi.connections[connection](tableName)
  const limitQuery = query.clone()

  if (_.isNumber(filter)) {
    filter = {
      id: filter
    }
  }
  await iterateFilterCriteria(query, filter, tableName, !noSelects)
  if (filter.limit) {
    await iterateFilterCriteria(limitQuery, filter, tableName)

    if (_.isFunction(modifyFn)) {
      limitQuery.modify(modifyFn, tableName)
    }
    limitQuery.distinct(`${tableName}.id`).limit(filter.limit)

    if (filter.skip) {
      limitQuery.offset(filter.skip)
    }
    query.whereIn(`${tableName}.id`, limitQuery)
  }
  if (!noSelects && !filter.select && !filter.count) {
    query.select('*')
  }
  if (_.isFunction(modifyFn)) {
    limitQuery.modify(modifyFn, tableName)
  }
  if (findOne) {
    await iterateFilterCriteria(limitQuery, filter, tableName)
    const firstId = await limitQuery.first(`${tableName}.id`).then((record) => record ? record.id : 0)

    return query.where(`${tableName}.id`, firstId).then(function (results) {
      return _.head(results)
    })
  } else {
    return query
  }
}

/**
 * Iterate the filter criteria applying it to the query
 * @param {Object}   query                        The query to filter
 * @param {Object}   filter                       The filter criteria
 * @param {String}   tableName                    The table name
 * @param {Boolean}  [applySelects=false]         If true, apply selects
 *
 * @return {Promise} That resolves with the query with filters applied
 */
function iterateFilterCriteria (query, filter, tableName, applySelects = false) {
  return pcsapi.Promise.all(_.map(filter, async function (value, key) {
    const isArray = _.isArray(value)
    const isObject = _.isObject(value)
    const isString = _.isString(value)

    switch (true) {
      case _.contains(['limit', 'skip'], key):
        return
      case key === 'count':
        if (applySelects) {
          query.count(`${tableName}.${value}`)
        }
        return
      case key === 'select':
        if (applySelects) {
          const selectAttributes = _.uniq(_.map(isString ? value.split(',') : value, function (attribute) {
            return `${tableName}.${_.trim(attribute)}`
          }).concat([`${tableName}.id`]))

          query.select(selectAttributes)
        }
        return
      case key === 'sort':
        if (applySelects) {
          const splitValue = value.split(' ')

          query.orderBy(`${tableName}.${splitValue[0]}`, splitValue[1])
        }
        return
      case isObject && !isArray:
        _.each(value, function (nestedValue, nestedKey) {
          if (nestedKey === '!') {
            query.whereNotIn(`${tableName}.${key}`, _.isArray(nestedValue) ? nestedValue : [nestedValue])
          } else {
            query.where(`${tableName}.${key}`, nestedKey, nestedValue)
          }
        })
        return
      default:
        query[isArray ? 'whereIn' : 'where'](`${tableName}.${key}`, value)
    }
  }))
}
