var express = require('express');
var router = express.Router();

var assignment = require('../services/assignments');
var submission = require('../services/submission');
const logger = require('../logger/loggerindex');
var helper = require('../config/helper');

// Middleware to check for query parameters
router.use((req, res, next) => {
    if (Object.keys(req.query).length !== 0) {
        return res.status(400).send();
    }
    next();
});

router.post('/', helper.pAuthCheck, assignment.createNewAssignment);

router.get('/', helper.pAuthCheck, assignment.getAssignmentList);

router.get('/:id', helper.pAuthCheck, assignment.getAssignmentDetails);

router.put('/:id', helper.pAuthCheck, assignment.putAssignmentDetails);

router.delete('/:id', helper.pAuthCheck, assignment.deleteAssignment);

router.post('/:id/submission', helper.pAuthCheck, submission.createNewSubmission); //added

// Add this to return 405 for PATCH requests
router.patch('/', (req, res) => {
    logger.error({uri: "/v1/assignments", statusCode: 405, message: "Method Not Allowed"});
    res.status(405).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
});

// Add this to return 405 for PATCH requests
router.patch('/:id', (req, res) => {
    logger.error({uri: "/v1/assignments" + req.params.id, statusCode: 405, message: "Method Not Allowed"});
    res.status(405).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
});

router.all('/:id/submission', (req, res) => {
    logger.error({uri: "/v1/assignments" + req.params.id + "/submission", statusCode: 405, message: "Method Not Allowed"});
    res.status(405).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
});

router.use('/:id/:wrongPath', (req, res) => {
    logger.error({uri: "/v1/assignments" + req.params.id + "/submission", statusCode: 400, message: "Enter correct path"});
    res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
});

module.exports = router;