const logger = require('../logger');

module.exports = function (err, req, res, next) {
    logger.error({ message: err.message, meta: err.stack});
    res.status(500).send('Something failed.');
}