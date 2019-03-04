/**
 * logger.js: Provides the application's logger
 */
'use strict'

const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-mongodb');

const moment = require('moment-timezone');
const { combine, printf, label, timestamp, colorize, prettyPrint } = format;

/**
 * Gets the timestamp and converts it to America/New_York (GMT-4) timezone using moment library
 * @param {TransformableInfo} info The Winston info object representing a single log message
 */
const toEasternTimeZone = format(info => {
    info.timestamp = moment().tz('America/New_York').format();
    return info;
})

/**
 * Custom colorize function so that everything can be colorized as opposed to only the level and message
 * that the default colorize function from Winston does
 */
const customColorize = format(info => {
    const colorizer = new colorize.Colorizer();
    const level = info.level;
    
    if (info.label) {
        info.label = `[${info.label}]`;
        info.label = colorizer.colorize(level, info.level, info.label);
    }

    if (info.meta) {
        info.meta = `[${colorizer.colorize(level, info.level, 'STACKTRACE')}] ${info.meta}`;
    }

    info.level = colorizer.colorize(level, info.level, info.level);
    info.timestamp = colorizer.colorize(level, info.level, info.timestamp);


    return info;
})
/**
 * Custom format to specify how an error is displayed.   
 * Apply colors
 * example output: 
 *      [2018-08-20T16:01:46-04:00 error]: Could not get the genres
 */
const loggerFormat = printf(info => {
    let message = `[${info.timestamp}${info.label ? ' ' + info.label + ' ' : ' '}${info.level}] ${info.message}`;
    if (info.meta) message += `\n${info.meta}`;
    return message;
})

/**
 * Logging levels for the logger and specify the colors for each
 * levels (when displayed in console)
 */
const loggerLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        verbose: 4,
        silly: 5
    },
    colors: {
        error: 'red bold',
        warn: 'yellow bold',
        info: 'green bold',
        debug: 'blue bold',
        verbose: 'cyan bold',
        silly: 'magenta bold',
    }
};
winston.addColors(loggerLevels.colors);

/**
 * The application logger  
 * Logs any level in console and logfile.log  
 * Logs errors in application's MongoDB database and in uncaughExceptions.log
 */
const logger = createLogger({
    format: combine(
        timestamp()
    ),
    levels: loggerLevels.levels,
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        //
        new transports.Console({
            level: 'silly',
            format: combine(
                customColorize(),
                loggerFormat
            ),
            handleExceptions: true
        }),
        new transports.File({
            filename: 'logs/errors.log',
            level: 'error',
            format: loggerFormat,
            handleExceptions: true
        }),
        new transports.File({
            filename: 'logs/combined.log',
            format: loggerFormat,
            handleExceptions: true
        }),
        new transports.File({
            filename: 'logs/exceptions.log',
            level: 'error',
            format: loggerFormat,
            handleExceptions: true
        })
    ]
});
// const logger = createLogger({
//     format: combine(
//         toEasternTimeZone(),
//         myFormat
//     ),
//     transports: [
//         new transports.Console({
//             format: combine(
//                 colorize(),
//                 myFormat
//             ),
//             handleExceptions: true
//         }),
//         new transports.File({
//             format: myFormat,
//             filename: 'logfile.log',
//             handleExceptions: true
//         }),
//         new transports.File({
//             level: 'error',
//             format: myFormat,
//             filename: 'uncaughtExceptions.log',
//             handleExceptions: true
//         })
//     ]
// });

module.exports = logger;

