/**
 * Generic Error Handler / Classifier
 *
 * Calls the appropriate custom response for a given error,
 * out of the bundled response modules:
 * badRequest, forbidden, notFound, & serverError
 *
 * Defaults to `res.serverError`
 *
 * Usage:
 * ```javascript
 * if (err) return res.negotiate(err);
 * ```
 *
 * @param {Error} err The error
 *
 */

module.exports = function(err) {
    const res = this.res,
        req = this.req;

    pcsapi.log.error(`negotiate.js`, err);

    return sendError(res, err);
};

/**
 * Sends error through to the response
 *
 * @private
 *
 * @param {Object} res response object
 * @param {Error} err error object
 */
function sendError(res, err) {
    const status = applyErrorStatusToResponse(res, err);

    sendErrorFromStatusCode(res, err, status);
};

/**
 * Send error in the response, method used is determined by the status code
 *
 * @param {Object} res The response
 */
function sendErrorFromStatusCode(res, err, status) {
    switch (status) {
        case 403:
            res.forbidden(err);
            break;
        case 404:
            res.notFound(err);
            break;
        default:
            if (status >= 400 && status < 500) {
                res.badRequest(err);
            } else {
                res.serverError(err);
            }
            break;
    }
};

/**
 * Get the error status code and apply it to the
 * response. If there error has no status then 500 is used as a default
 *
 * @param {Object} res The response
 * @param {Error} err The error
 */
function applyErrorStatusToResponse(res, err) {
    const status = err.status || 500;
    res.status(status);
    return res;
};