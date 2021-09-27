/**
 * @class responses.ok
 *
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 * return res.ok(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

module.exports = function sendOK(data, statusCode) {
  const res = this.res

  return respond(res, cleanResponseData(data), statusCode)
}

/**
 * Remove toJSON functions left by model instances before passing on to res.json which calls JSON.stringify (which in turn calls toJSON at all levels)
 *
 * @param {Object} data The data to remove toJSON functions from
 *
 * @return {Object} data The data with toJSON functions removed
 */
function cleanResponseData(data) {
  for (let prop in data) {
    if (prop === 'toJSON') {
      data[prop] = undefined
    } else if (_.isObject(data[prop])) {
      cleanResponseData(data[prop])
    }
  }

  return data
}

function respond(res, record) {
  pcsapi.log.verbose(
    `ok.js - respond - Sending 200 response to ${res.req.originalUrl} request`
  )

  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify(record))
}
