const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
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


const validateEmail = (email) => {
    const reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(email);
};

const getDecryptedCreds = (authHeader) => {
  const base64Creds = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Creds, "base64").toString("ascii");
  const email = credentials.split(":")[0];
  const pass = credentials.split(":")[1];
  return {email, pass};
};

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
      */

    console.log('Authorization successful');
    next();  
  } catch (error) {
      console.error(error);
      return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Invalid token' });
  }
};

module.exports = {
    createPassHash,
    uAuthCheck,
    pAuthCheck 
};

