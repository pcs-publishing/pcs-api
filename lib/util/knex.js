'use strict'

/**
 * @class util.knex
 *
 * Methods for knex query modification
 */
const timingUtil = require('./timing')
const arrayUtil = require('./array')
const valueUtil = require('./value')

module.exports = {
  /**
   * Apply paging info to the passed query
   * @param {Object} query The query to apply the paging info to
   * @param {Number} itemsPerPage The number of items per page
   * @param {Number} pageNumber The page number
   *
   * @return {Object} query The query with the page info applied
   */
  applyPagingInfo: function (query, itemsPerPage, pageNumber) {
    if (_.isNumber(itemsPerPage) && _.isNumber(pageNumber)) {
      const offset = itemsPerPage * (pageNumber - 1)

      return query.limit(itemsPerPage).offset(offset)
    } else {
      return query
    }
  },

  /**
   * Apply sorters to the query
   * @param {Object}            query                        The query to get the count from
   * @param {Object|Object[]}   sorters                      The sort object(s)
   * @param {Object[]}          [nullsLastSorters=[]]        The sorters for which to apply a 'nulls last' sort and their null sort property
   *
   * @return {Promise} That resolves with the query sorted
   */
  applySortToQuery: function (query, sorters, nullsLastSorters = []) {
    if (!sorters || _.isEmpty(sorters)) {
      return query
    }
    if (!_.isArray(sorters)) {
      sorters = [sorters]
    }
    for (let sorter of sorters) {
      const nullsLastSorter = _.find(
        nullsLastSorters,
        nullsLastSorter => nullsLastSorter.property === sorter.property
      )

      if (nullsLastSorter) {
        query.orderByRaw(nullsLastSorter.nullProperty)
      }
      query.orderBy(sorter.property, sorter.direction)
    }

    return query
  },

  /**
   * Get count of records in the passed query
   * @param {Object} query The query to get the count from
   * @param {String} [distinctBy] The column to count distinct by
   *
   * @return {Promise} That resolves with the number of records
   */
  getCount: function (query, distinctBy) {
    if (distinctBy) {
      query.countDistinct(distinctBy)
    } else {
      query.count()
    }

    return query.then(results => parseInt(_.head(results).count, 10))
  },

  /**
   * Select the user's name in the given query
   * @param  {Object} query                The query
   * @param  {String} userAttribute        The attribute to join to user with
   * @param  {String} [alias='user_name']  The alias to use for select
   *
   */
  selectUserName: function (query, userAttribute, alias = 'user_name') {
    if (!this.isQueryAlreadyJoinedWithTable(query, 'user')) {
      query.leftJoin('user', 'user.id', userAttribute)
    }
    return query
      .leftJoin('contact', 'user.contact', 'contact.id')
      .leftJoin('person', 'contact.person', 'person.id')
      .select(
        pcsapi.connections['prospect'].raw(
          `trim(concat(person.title, ' ', trim(concat(person.forename, ' ', person.surname)))) as ${alias}`
        )
      )
  },

  /**
   * Is the query already joined with the passed table
   *
   * @param {Object} query The query to check
   * @param {String} tableName The table to check if the query is joined with
   *
   * @return {Boolean} True if the query is already joined with that table
   */
  isQueryAlreadyJoinedWithTable: function (query, tableName) {
    if (query._single && query._single.table === tableName) {
      return true
    }
    return !!_.find(
      query._statements,
      statement =>
        statement.hasOwnProperty('joinType') &&
        statement.table &&
        statement.table.toUpperCase() === tableName.toUpperCase()
    )
  },

  /**
   * Formats the knex query output
   *
   * @param  {Object[]}         queryResult                       the query results to format
   * @param  {String|Function}  [uniqueGroupingAttribute = 'id']  the anchor - attribute to union records by, defaults to id
   * @param  {String}           [callerName= '']                  the name of the function calling this function
   *
   * @return {Object[]} formatted query result
   */
  formatNestedOutput: function (
    queryResults,
    uniqueGroupingAttribute = 'id',
    callerName = ''
  ) {
    if (_.isEmpty(queryResults)) {
      return queryResults
    } else {
      timingUtil.start('formatNestedOutput')
      queryResults = formatNestedObjects(queryResults)
      queryResults = formatNestedArrays(queryResults, uniqueGroupingAttribute)
      timingUtil.elapsed(
        'formatNestedOutput',
        `Formatted nested data for knex query - called from ${callerName}`
      )

      return queryResults
    }
  },

  /**
   * Adds to the query if the desiredValue is not null
   *
   * @param {Object}       query            The query
   * @param {String}       attributeName    The attribute name to be queried
   * @param {Number[]|Number}     desiredValues    The desired values for the attribute
   *
   * @return {Object}  The query with or without the added where
   */
  addToQueryIfPresent: function (query, attributeName, desiredValues) {
    if (!_.isArray(desiredValues)) {
      desiredValues = desiredValues ? [desiredValues] : []
    }

    desiredValues = _.compact(desiredValues)
    if (!_.isEmpty(desiredValues)) {
      return query.whereIn(attributeName, desiredValues)
    } else {
      return query
    }
  },

  /**
   * Filter query column to where it matches a value or is null
   *
   * @param {Object} query The query to filter
   * @param {String} column The column to filter the query on
   * @param {Number|String|Date|Boolean} value The value to filter to
   *
   * @return {Object} The query where column matches the value or the column is null
   */
  filterQueryColumnToValueOrNull: function (query, column, value) {
    return query.where(function () {
      return this.where(column, value).orWhereNull(column)
    })
  }
}

/**
 * Formats the nested object where it encounters '.' (dot) in the keys name
 *
 * @param  {Object[]} queryResults  the query results
 *
 * @return {Object[]} query results with formatted nesting
 */
function formatNestedObjects(queryResults) {
  const nestedObjectKeys = arrayUtil.compactMap(
    queryResults[0],
    (value, key) => {
      if (_.isString(key) && key.includes('.')) {
        return key
      }
    }
  )

  if (!_.isEmpty(nestedObjectKeys)) {
    _.each(queryResults, result => {
      _.each(nestedObjectKeys, nestedObjectKey => {
        const nestedKeys = nestedObjectKey.split('.')
        const firstKey = _.head(nestedKeys)

        if (valueUtil.hasValue(result[nestedObjectKey])) {
          if (!_.isObject(result[firstKey])) {
            result[firstKey] = null
          }
          _.set(result, nestedKeys, result[nestedObjectKey])
        } else if (!_.isObject(result[firstKey])) {
          result[firstKey] = null
        }

        delete result[nestedObjectKey]
      })
    })
  }

  return queryResults
}

/**
 * Formats the arrays where id encounters '[]' (array) at the start of the key
 *
 * @param  {Object[]} queryResults  query results
 * @param  {String|Function} [uniqueGroupingAttribute='id'] The unique property on which to group the results by
 *
 * @return {Object[]} formatted query results
 */
function formatNestedArrays(queryResults, uniqueGroupingAttribute) {
  const nonNestedArrayKeys = []
  const nestedArrayKeys = []
  const formatAsObject = !_.isArray(queryResults)
  let formattedResults = []

  queryResults = _.isArray(queryResults) ? queryResults : [queryResults]
  const firstRecord = _.head(queryResults)

  if (!_.isObject(firstRecord) || _.isDate(firstRecord)) {
    return formatAsObject ? firstRecord : queryResults
  }

  _.each(queryResults, record => {
    _.each(record, (value, key) => {
      if (!_.isFunction(key.endsWith)) {
        if (!_.includes(nonNestedArrayKeys, key)) {
          nonNestedArrayKeys.push(key)
        }
        return
      }

      if (key.endsWith('[]')) {
        if (!_.includes(nestedArrayKeys, key)) {
          nestedArrayKeys.push(key)
        }
      } else {
        if (!_.includes(nonNestedArrayKeys, key)) {
          nonNestedArrayKeys.push(key)
        }
      }

      if (_.isObject(value) && !_.isDate(value)) {
        record[key] = formatNestedObjects(value)
        record[key] = formatNestedArrays(value, uniqueGroupingAttribute)
      }
    })
  })

  if (_.isEmpty(nestedArrayKeys)) {
    formattedResults = _.map(queryResults, queryResult =>
      _.pick(queryResult, nonNestedArrayKeys)
    )

    if (
      !_.isEmpty(formattedResults) &&
      formattedResults[0][uniqueGroupingAttribute]
    ) {
      formattedResults = arrayUtil.uniqueBy(
        formattedResults,
        uniqueGroupingAttribute,
        true
      )
    }
  } else {
    const groupedResults = _.groupBy(queryResults, uniqueGroupingAttribute)

    _.forIn(groupedResults, (value, groupKey) => {
      const formattedRecord = _.pick(value[0], nonNestedArrayKeys)

      _.each(nestedArrayKeys, key => {
        let uniqueValuesForKey = _.unique(arrayUtil.compact(_.map(value, key)))

        if (
          !_.isEmpty(uniqueValuesForKey) &&
          uniqueValuesForKey[0][uniqueGroupingAttribute]
        ) {
          uniqueValuesForKey = arrayUtil.uniqueBy(
            uniqueValuesForKey,
            uniqueGroupingAttribute,
            true
          )
        }

        formattedRecord[key.replace('[]', '')] = _.sortBy(
          uniqueValuesForKey,
          uniqueGroupingAttribute
        )
      })

      formattedResults.push(formattedRecord)
    })
  }

  if (formatAsObject && formattedResults.length === 1) {
    return _.head(formattedResults)
  }

  return formattedResults
}
