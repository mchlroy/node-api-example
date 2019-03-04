const express = require('express');

const server = express();
server.use(express.json());

require('./startup/logging')(server);
require('./startup/routes')(server);

module.exports = server;