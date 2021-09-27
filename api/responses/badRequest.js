module.exports = function badRequest(data, options) {
  const res = this.res

  // Set status code
  res.status(400)

  pcsapi.log.verbose(
    `badRequest.js - respond - Sending 400 response to ${res.req.originalUrl} request`
  )

  return res.jsonx(data)
}
