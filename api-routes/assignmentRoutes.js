var express = require('express');
var router = express.Router();

var assignment = require('../services/assignments');
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

// Add this to return 405 for PATCH requests
router.patch('/', (req, res) => {
    res.status(405).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
});

// Add this to return 405 for PATCH requests
router.patch('/:id', (req, res) => {
    res.status(405).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
});

module.exports = router;