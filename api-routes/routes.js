var express = require('express');
var router = express.Router();
var user = require('../services/user');
var helper = require('../config/helper');
router.post('/', helper.uAuthCheck, user.newUser);
module.exports = router;