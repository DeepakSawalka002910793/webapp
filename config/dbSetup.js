const Sequelize = require("sequelize");
const dotenv = require('dotenv');
dotenv.config();

const createUserModel = require('../models/user.model');
const createAssignmentModel = require('../models/assignment.model');

const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.DBUSER,
    process.env.DBPASS,
     {
       host: process.env.DBHOST,
       port: process.env.DBPORT,
       dialect: 'mariadb',
       "define": {
             freezeTableName: true
         },    
         logging: false  
     }
);

let db = {};

db.sequelize = sequelize;


db.user = createUserModel(sequelize);
db.assignment = createAssignmentModel(sequelize);

module.exports = db;