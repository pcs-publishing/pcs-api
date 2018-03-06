module.exports = function serverError(data, options) {
    var req = this.req;
    var res = this.res;

    // Set status code
    res.status(500);

    pcsapi.log.verbose(`serverError.js - respond - Sending 500 response to ${res.req.originalUrl} request`);

    return res.jsonx(data);
};