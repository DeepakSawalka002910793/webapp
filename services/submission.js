const helper = require('../config/helper');
const db = require('../config/dbSetup');
const logger = require('../logger/loggerindex');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

// Configure AWS
AWS.config.update({ region: process.env.AWS_REGION });
const sns = new AWS.SNS();

const createNewSubmission = async (req, res) => { // Create new Submission function

    helper.statsdClient.increment('POST_submissiondetails');
    if(!req.body.submission_url || typeof req.body.submission_url !== 'string' ||
        (typeof req.body.submission_url === 'string' && req.body.submission_url.trim() === '') ||
        !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/archive\/refs\/tags\/[A-Za-z0-9_.-]+\.zip$/.test(req.body.submission_url) || Object.keys(req.body).length > 1)
         {
            logger.error({method: "POST", uri: "/v1/assignments" + req.params.id + "/submission", statusCode: 400, message: "Enter Valid Request Body"});
            return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        } 
        

    try{

        const response = await axios.head(req.body.submission_url);

        const assignmentObj = await db.assignment.findByPk(req.params.id); 

        // Check if the assignment exists
        if (!assignmentObj) {
            logger.error({method: "PUT", uri: "/v1/assignments/" + req.params.id, statusCode: 404, message:"Assignment Already exists"});
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }

        /*let assignmentObj = await db.assignment.findOne({ where: { assignment_id: req.params.id } });
        

        if (!assignmentObj) {
            // Handle case where assignment does not exist
            logger.error({method: "POST", uri: "/v1/assignments" + req.params.id + "/submission", statusCode: 404, message: "Assignment Not found (Incorrect id)"});
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').send("no");
        }*/

        // Check if the deadline has not passed
        if (new Date(assignmentObj.deadline) < new Date()) {
            logger.error({method: "POST", uri: "/v1/assignments" + req.params.id + "/submission", statusCode: 400, message: "Deadline has passed"});
            return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }

        // Check the number of attempts
        let submissionCount = await db.submission.count({ where: { assignment_id: req.params.id } });
        if (submissionCount >= assignmentObj.num_of_attempts) {
            logger.error({method: "POST", uri: "/v1/assignments" + req.params.id + "/submission", statusCode: 400, message: "Maximum number of attempts exceeded"});
            return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }   
        
        
        const { eMail } = helper.getDecryptedCreds(req.headers.authorization);
        const message = {
            submission_url: req.body.submission_url,
            email: eMail
        };
        const params = {
            Message: JSON.stringify(message),
            TopicArn: process.env.SNS_TOPIC_ARN
        }; 
        await sns.publish(params).promise();

        let data = await db.submission.create({
            assignment_id: req.params.id,
            submission_url: req.body.submission_url,
            submission_date: new Date().toISOString(),
            assignment_updated: new Date().toISOString()
        });

        let result = {
            "id": data.dataValues.id,
            "assignment_id": data.dataValues.assignment_id,
            "submission_url": data.dataValues.submission_url,
            "submission_date": data.dataValues.submission_date,
            "assignment_updated": data.dataValues.assignment_updated,  
        }
        logger.info({method: "POST", uri: "/v1/assignments" + req.params.id + "/submission", statusCode: 201, message: "Submission Accepted" });
        return res.status(201).set('Cache-Control', 'no-store, no-cache, must-revalidate').json(result);
    }catch(err) {

            if (axios.isAxiosError(err)) {
                if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                    logger.error({ method: "POST", uri: "/v1/assignments" + req.params.id + "/submission", statusCode: err.response.status, message: "Axios error: " + err.message });
                    return res.status(err.response.status).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
                }}
                else {
                    console.log("error", err)
                    logger.error({method: "POST", uri: "/v1/assignments" + req.params.id + "/submission", statusCode: 500, message: "Server error" + err });
                    res.status(500).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }}
}

module.exports = {
    createNewSubmission
}