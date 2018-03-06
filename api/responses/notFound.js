module.exports = function notFound(data, options) {
    var req = this.req;
    var res = this.res;

    // Set status code
    res.status(404);

    pcsapi.log.verbose(`notFound.js - respond - Sending 404 response to ${res.req.originalUrl} request`);

    return res.jsonx(data);
};