const bcrypt = require("bcrypt");
const db = require('./dbSetup');
const dotenv = require('dotenv');
const StatsD = require('node-statsd');
const logger = require('../logger/loggerindex');
const statsdClient = new StatsD();

dotenv.config();


const createPassHash = async (pass) => {
    const salt = await bcrypt.genSalt();
    const hashedpassword = await bcrypt.hash(pass, salt);
    return hashedpassword
}


const getDecryptedCreds = (authHeader) => {
  const base64Creds = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Creds, "base64").toString("ascii");
  const eMail = credentials.split(":")[0];
  const pass = credentials.split(":")[1];
  return {eMail, pass};
};

const pAuthCheck = async (req, res, next) => {
  //Check if auth header is present and is a basic auth header.
  if (!req.headers.authorization || req.headers.authorization.indexOf("Basic") === -1) {
    logger.error({statusCode: 401, message:"Header Auth missing - Unauthorized"});
    return res.status(401).send();
  }

  //decode the auth header
  let {eMail, pass} = getDecryptedCreds(req.headers.authorization);
  const id = req?.params?.id;

  //Check if user is valid
  let user = await validUser(eMail, pass);

  if (!eMail || !pass || !user) {
    logger.error({statusCode: 401, message:"Details of user are not correct - Unauthorized"});
    return res.status(401).send();
  } 

   // Attach user to req object
   req.user = user.dataValues;

  if(id) {
    //Check if user creds match the user at id.
    let dbCheck = await dbAssignVal(eMail, pass,id);
    if(dbCheck) {
        logger.error(`Details of user incorrect- ${dbCheck}`);
        return res.status((dbCheck=='Forbidden')?403:404).json({
          message: dbCheck,
        });
    } 
  }

  next();
}


const dbAssignVal = async (eMailId, pass, id) => {
  let userInfo = await db.user.findOne({where: {email:eMailId}, attributes: ['id']});
  let assignInfo = await db.assignment.findOne({where: {id:id}, attributes:['owner_user_id']});
  if (!assignInfo) {
      return 'Not Found';
  }

  if(userInfo.dataValues.id !== assignInfo.dataValues.owner_user_id) {
    return 'Forbidden';
  }

  return '';
}

const validateEmail = (eMailId) => {
  var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (eMailId.match(reg)) {
    return true;
  }

  return false;
}

const validUser = async (eMail, pass) => {
  // Validate the credentials and return the user information if valid
  const user = await db.user.findOne({ where: { email: eMail }, attributes: ['id', 'email', 'password'] });
  if (!user || !(await bcrypt.compare(pass, user.password))) {
    return null;
  }

  return user;  // Return user object instead of true
};

const dbCredVal = async (eMailId, pass, id) => {
  const user = await db.user.findOne({ where: { email: eMailId }, attributes: ['id'] });
  const assignment = await db.assignment.findOne({ where: { id }, attributes: ['owner_user_id'] });
  
  if (!assignment) {
    return 'Not Found';
  }

  if (user.id !== assignment.owner_user_id) {
    return 'Forbidden';
  }

  return '';  // Consider returning null or undefined to indicate no error
};


module.exports = {
    createPassHash,
    dbCredVal,
    validateEmail,
    validUser,
    getDecryptedCreds,
    pAuthCheck,
    statsdClient  
};

