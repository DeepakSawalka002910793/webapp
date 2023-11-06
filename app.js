const app = require('./server');
const logger = require('./logger/loggerindex');

app.listen(process.env.PORT);
logger.info({message:"Server is listening on port: " + process.env.PORT});