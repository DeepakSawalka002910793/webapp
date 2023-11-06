const appRoot = require('app-root-path');
const winston = require('winston');
const { createLogger, format, transports } = winston;

// Custom formatter function
const customFormatter = format.printf((info) => {
  // Construct log message as object
  const logMessage = {
    timestamp: info.timestamp,
    level: info.level.toUpperCase(),
    method: info.method,
    uri: info.uri,
    statusCode: info.statusCode,
    message: info.message,
  };


  // Convert log message to string
  return `${info.timestamp} ${info.level.toUpperCase()}: ${JSON.stringify(logMessage, null, 2)}`;
});

// Create the logger
const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
    customFormatter
  ),
  transports: [
    new transports.File({ filename: `${appRoot}/logs/csye6225.log` }),
  ],
});

module.exports = logger;
