const bcrypt = require("bcrypt");
const db = require('./dbSetup');
const dotenv = require('dotenv');
dotenv.config();
const secretKey = process.env.SECRET_KEY;
 // You should store it in an environment variable or other secure places

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
  return {eMail, pass};}


  const pAuthCheck = async (req, res, next) => {
    //Check if auth header is present and is a basic auth header.
    if (!req.headers.authorization || req.headers.authorization.indexOf("Basic ") === -1) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    //decode the auth header
    let {eMail, pass} = getDecryptedCreds(req.headers.authorization);
    const id = req?.params?.id;
  
    //Check if user is valid
    let user = await validUser(eMail, pass);
  
    if (!eMail || !pass || !user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    } 
  
     // Attach user to req object
     req.user = user.dataValues;
  
    if(id) {
      //Check if user creds match the user at id.
      let dbCheck = await dbAssignVal(eMail, pass,id);
      if(dbCheck) {
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
  /*
    let result = await db.user.findOne({where: {email:eMail}, attributes: ['password']});
    if (!result?.dataValues?.password) {
        return false;
    }
  
    let passCheck = await bcrypt.compare(pass, result.dataValues.password);
    if(!passCheck) {
      return false;
    }
  
    return true;
  }
  */
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


/*
  let result = await db.user.findOne({where: {id:id}, attributes: ['email','password']});
  if (!result) {
      return 'Not Found';
  }

  let {eMailRes, password} = result.dataValues;
  let passCheck = await bcrypt.compare(pass, password);
  if(eMailRes !== eMailId || !passCheck) {
    return 'Forbidden';
  }

  return '';
}
*/
/*
const uAuthCheck = async (req, res) => {
  if (!req.headers.authorization || req.headers.authorization.indexOf("Basic ") === -1) {
    return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: "Unauthorized" });
  }

  let {email, pass} = getDecryptedCreds(req.headers.authorization);

  if (!validateEmail(email)) {
    return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({
      message: "Invalid email format",
    });
  }

  let user = await db.user.findOne({ where: { email } });

  if (user && await bcrypt.compare(pass, user.password)) {
    const expiresIn = 3600;  // Expires in 3600 seconds (1 hour)
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + expiresIn);  // Set the expiration time
    const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });

    req.user = user; // attach user information to request object
    return res.json({ token, expiration });
    // attach token to request object
    
  } else {
    res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Invalid credentials' });
  }
};

const pAuthCheck = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;  

      //const userIdInParams = req.params.id;
      /*
      if (userIdInParams && userIdInParams != decoded.id) { 
          return res.status(403).json({ message: 'Forbidden' });
      }
      

    console.log('Authorization successful');
    next();  
  } catch (error) {
      console.error(error);
      return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Invalid token' });
  }
};
*/




module.exports = {
    createPassHash,
    dbCredVal,
    validateEmail,
    validUser,
    getDecryptedCreds,
    pAuthCheck
    //uAuthCheck,
    
};
