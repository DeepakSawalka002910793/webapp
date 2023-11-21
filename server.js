var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const methodOverride = require('method-override');
const logger = require('./logger/loggerindex');
const { newUser } = require('./services/user');
const helper = require('./config/helper')
app.use(bodyParser.json());

var userRoutes = require('./api-routes/routes');
const assignmentRoutes = require('./api-routes/assignmentRoutes');

const db = require('./config/dbSetup');
db.user.hasMany(db.assignment, {foreignKey: "owner_user_id"});
db.sequelize.sync({force: false})
  .then(() =>{
   
  // Call the newUser function to process and insert the CSV data
   newUser({}, {                   // Passing an empty req object and defining res object
    status: function(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json: function(data) {
      console.log('Response:', data);

      // Check if the data load was successful
      if (this.statusCode === 201) {
        logger.info({message:'Data loaded successfully into the database'}); 
      }
    }
  });
})
.catch((error) => {
  logger.error({message:"Database setup failed" + error});
});

app.get('/healthz', function(req, res) {

  helper.statsdClient.increment('healthz_counter');
  if(Object.keys(req.body).length !== 0 || Object.keys(req.query).length > 0) {
    // Send 400 error if the body is not empty
    logger.error({method: "GET", uri: "/healthz", statusCode: 400, message:"Enter valid request body and no query params"});
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(400).send();
  } else {
    // Check database connection
    db.sequelize.authenticate()
      .then(() => {
        // If connected, send 200 status
        logger.info({method: "GET", uri: "/healthz", statusCode: 200, message:"healthz is working fine"});
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.status(200).send(); 
      })
      .catch(() => {
        // If an error occurs, send a 503 error
        logger.error({method: "GET", uri: "/healthz", statusCode: 503, message:"healthz is not working server unavailable"});
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.status(503).send();
      });
  }
});

app.use('/healthz', (req, res) => {
  helper.statsdClient.increment('healthz_counter');
  if (req.method !== 'GET') {
    logger.error({ uri: "/healthz", statusCode: 405, message:"Change the method to GET (Method not allowed)"});
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(405).send();
  }   
});


app.use('/v1/assignments', assignmentRoutes);

app.use((req, res) => {
  res.status(404).send();
});

app.use(methodOverride())
app.use((err, req, res, next) => {
  return res.status(400).send();
})


module.exports = app;