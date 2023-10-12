var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const methodOverride = require('method-override');
const { newUser } = require('./services/user');
const jsonlint = require('jsonlint-mod');

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
        console.log('Data loaded successfully into the database.');
        
        
      }
    }
  });
})
.catch((error) => {
  console.log("Database setup failed.",error);
});

app.get('/healthz', function(req, res) {

  if(Object.keys(req.body).length !== 0 || JSON.stringify(req.body) !== '{}' || Object.keys(req.query).length > 0) {
    // Send 400 error if the body is not empty
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(400).send();
  } else {
    // Check database connection
    db.sequelize.authenticate()
      .then(() => {
        // If connected, send 200 status
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.status(200).send(); 
      })
      .catch(() => {
        // If an error occurs, send a 503 error
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.status(503).send();
      });
  }
});

app.use('/healthz', (req, res) => {
  if (req.method !== 'GET') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(405).send();
  }   
});


app.use('/v1/assignments', assignmentRoutes);

app.use(methodOverride())
app.use((err, req, res, next) => {
  return res.status(400).send();
})
module.exports = app;