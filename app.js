const app = require('./server');

app.listen(process.env.PORT);
logger.info("Server is listening on port:", process.env.PORT);
