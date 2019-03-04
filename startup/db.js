const mongoose = require('mongoose');
const logger = require('../logger');
const config = require('config');

module.exports = function () {
    const db = config.get('db');
    // Connect to the database
    mongoose.connect(db, { useNewUrlParser: true, reconnectTries: 5 })
        .then(() => logger.info(`Connected to ${db}`))
}
