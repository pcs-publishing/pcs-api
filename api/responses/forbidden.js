module.exports = function forbidden(data, options) {
  const res = this.res

  // Set status code
  res.status(403)

  pcsapi.log.verbose(
    `forbidden.js - respond - Sending 403 response to ${res.req.originalUrl} request`
  )

  return res.jsonx(data)
}
