'use strict'

/**
 * @class util.query
 *
 * Query methods
 */
const datetimeUtil = require('./datetime')

module.exports = {
  /**
   * Filter the passed in query to find active records that have not expired
   *
   * @param {Object} query knex query to filter
   * @param {String} [prefixFieldName] The prefix to apply to the field names
   *
   * @return {Object} query A knex query
   */
  findActive: function (query, prefixFieldName) {
    const currentDateTime = datetimeUtil.getServerDateTime()
    let activationField = 'activation_date'
    let expiryField = 'expiry_date'

    if (prefixFieldName) {
      activationField = prefixFieldName + '.' + activationField
      expiryField = prefixFieldName + '.' + expiryField
    }

    return query
      .where(activationField, '<=', currentDateTime)
      .andWhere(function () {
        this.where(expiryField, '>', currentDateTime).orWhereNull(expiryField)
      })
  },

  /**
   * Filter the given query to contain active records only, any that are active at any point between the start and end date
   *
   * @param {Object}   query                                                              The query to filter
   * @param {String}   options.tableName                                                  The name of the table to filter active for
   * @param {Date}     [options.startDate=datetimeUtil.getServerDateTime()]       The date to check the activation date against, defaults to system date
   * @param {Date}     [options.endDate=datetimeUtil.getServerDateTime()]         The date to check the expiry date against, defaults to system date
   * @param {String}   [options.activationAttribute='activation_date']                    The activation attribute
   * @param {String}   [options.expiryAttribute='expiry_date']                            The expiry attribute
   *
   * @return {Object} The filtered query
   */
  filterQueryToActiveOnly: function (
    query,
    {
      tableName,
      startDate = datetimeUtil.getServerDateTime(),
      endDate = datetimeUtil.getServerDateTime(),
      activationAttribute = 'activation_date',
      expiryAttribute = 'expiry_date'
    } = {}
  ) {
    return this.filterToExcludeExpired(query, {
      tableName,
      date: startDate,
      expiryAttribute
    }).where(function () {
      this.where(
        `${tableName}.${activationAttribute}`,
        '<=',
        endDate
      ).orWhereNull(`${tableName}.${activationAttribute}`)
    })
  },

  /**
   * Filter the given query to contain expired records only
   *
   * @param {Object}   query                                                              The query to filter
   * @param {String}   options.tableName                                                  The name of the table to filter expired for
   * @param {Date}     [options.date=datetimeUtil.getServerDateTime()]            The date to check against, if not passed system time is used
   * @param {String}   [options.activationAttribute='activation_date']                    The activation attribute
   * @param {String}   [options.expiryAttribute='expiry_date']                            The expiry attribute
   *
   * @return {Object} The filtered query
   */
  filterQueryToExpiredOnly: function (
    query,
    {
      tableName,
      date = datetimeUtil.getServerDateTime(),
      activationAttribute = 'activation_date',
      expiryAttribute = 'expiry_date'
    } = {}
  ) {
    query = this.checkIfQueryExists(query, tableName)

    return query.where(function () {
      this.where(`${tableName}.${activationAttribute}`, '>', date).orWhere(
        `${tableName}.${expiryAttribute}`,
        '<=',
        date
      )
    })
  },

  /**
   * Filters expired records
   *
   * @param {Object}   query                                                    The query to filter
   * @param {String}   options.tableName                                        The name of the table to filter active for
   * @param {Date}     [options.date=datetimeUtil.getServerDateTime()]  The date to check against, if not passed system time is used
   * @param {String}   [options.expiryAttribute='expiry_date']                  The expiry attribute
   *
   * @return {Object} The query with the filters applied
   */
  filterToExcludeExpired: function (
    query,
    {
      tableName,
      date = datetimeUtil.getServerDateTime(),
      expiryAttribute = 'expiry_date'
    } = {}
  ) {
    const expiryField = `${tableName}.${expiryAttribute}`

    query = this.checkIfQueryExists(query, tableName)

    return query.where(function () {
      this.where(expiryField, '>=', date).orWhereNull(expiryField)
    })
  },

  /**
   * If the passed query exists return it, otherwise return a new query for the passed table name
   *
   * @param {Object} query The query to check
   * @param {String} tableName The table name to generate the new query for
   *
   * @return {Object} The query if is exists or a new query on the passed table name
   */
  checkIfQueryExists: function (query, tableName) {
    return !query ? pcsapi.connections.prospect(tableName) : query
  }
}
