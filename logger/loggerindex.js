const appRoot = require('app-root-path');
const winston = require('winston');
const { createLogger, format, transports } = winston;

// Custom formatter function
const customFormatter = format.printf((info) => {
  // Construct log message as object
  let logMessage = {
    timestamp: info.timestamp,
    level: info.level.toUpperCase(),
    message: info.message
  };

  // Conditionally add properties if they exist
  if (info.method) logMessage.method = info.method;
  if (info.uri) logMessage.uri = info.uri;
  if (info.statusCode) logMessage.statusCode = info.statusCode;

  // Convert log message to a single line string
  return `${logMessage.timestamp} ${logMessage.level}: ${JSON.stringify(logMessage)}`;
});

// Create the logger
const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZZ' }), // timestamp format
    customFormatter
  ),
  transports: [
    new transports.File({ filename: `${appRoot}/logs/csye6225.log` }),
  ],
});

module.exports = logger;

