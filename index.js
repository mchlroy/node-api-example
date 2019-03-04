const helmet = require('helmet');
const express = require('express');

const app = express();
app.use(express.json());

require('express-async-errors');

require('./startup/logging')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

const logger = require('./logger');

// app.use(helmet());

const port = process.env.PORT || 0;

const server = app.listen(port, () => logger.info(`Listening on port ${port}...`));

module.exports = server;

