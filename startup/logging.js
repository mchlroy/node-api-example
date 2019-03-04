const morgan = require('morgan');
const logger = require('../logger');

module.exports = function (app) {
    // Handles the promises rejection, goes into the winston logging pipeline when we 
    // throw it
    process.on('unhandledRejection', ex => {
        throw ex;
    });

    // Enable Morgan logger if environment is development
    if (app.get('env') === 'development') {
        app.use(morgan('tiny'));
        logger.info('Morgan enabled...');
    }
}