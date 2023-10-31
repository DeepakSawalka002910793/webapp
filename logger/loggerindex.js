var appRoot = require('app-root-path');
var winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [new winston.transports.File({ filename: `${appRoot}/logs/csye6225.log`})],
  });
  
  module.exports = logger;