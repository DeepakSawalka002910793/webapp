const helper = require('../config/helper');
const db = require('../config/dbSetup');
const logger = require('../logger/loggerindex');

const createNewAssignment = async (req, res) => { // Create new Assignment function

    helper.statsdClient.increment('POST_assigndetails');
    if(!req.body.name || 
        !req.body.points || 
        !req.body.num_of_attempts || 
        !req.body.deadline ||
        (req.body.points && (req.body.points < 1 || typeof req.body.points=== 'string' || req.body.points > 100)) ||
        (req.body.num_of_attempts && (req.body.num_of_attempts < 1 || typeof req.body.num_of_attempts=== 'string' || req.body.num_of_attempts > 100) ||
        (typeof req.body.name === 'number' || !isNaN(parseFloat(req.body.name)) && isFinite(req.body.name))
        || (typeof req.body.name === 'string' && req.body.name.trim() === '') || Object.keys(req.body).length > 4))
         {
            logger.error({method: "POST", uri: "/v1/assignments", statusCode: 400, message: "Enter Valid Request Body"});
            return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        } 
        

    try{
        let assignmentObj = await db.assignment.findOne({where:{name:req.body.name}});
        if(assignmentObj) {
            logger.error({method: "POST", uri: "/v1/assignments", statusCode: 400, message: "Assignment already exist"});
            return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }

        let {eMail, pass} = helper.getDecryptedCreds(req.headers.authorization);
        let user = await db.user.findOne({where:{email:eMail}});
       
    
        let data = await user.createAssignment({
            name:req.body.name,
            points: req.body.points,
            num_of_attempts: req.body.num_of_attempts,
            deadline: req.body.deadline,
            assignment_created: new Date().toISOString(),
            assignment_updated: new Date().toISOString()
        });

        let result = {
            "id": data.dataValues.id,
            "name": data.dataValues.name,
            "points": data.dataValues.points,
            "num_of_attempts": data.dataValues.num_of_attempts,
            "deadline": data.dataValues.deadline,
            "assignment_created": data.dataValues.assignment_created,
            "assignment_updated": data.dataValues.assignment_updated,
            
        }
        logger.info({method: "POST", uri: "/v1/assignments", statusCode: 201, message: "Assignment created Successfully!!" });
        return res.status(201).set('Cache-Control', 'no-store, no-cache, must-revalidate').json(result);
    }catch(err) {
        logger.error({method: "POST", uri: "/v1/assignments", statusCode: 500, message: "Server error" + err });
        res.status(500).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }
}

const putAssignmentDetails = async (req, res) => {  

    helper.statsdClient.increment('PUT_assigndetails');
    
    const userId = req.user.id;
    if (!userId) {
        logger.error({method: "PUT", uri: "/v1/assignments/" + req.params.id, statusCode: 401, message: "Unauthorised user" });
        return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }
    
    if (Object.keys(req.body).length === 0) {
        // Send 400 status if the body is empty
        logger.error({method: "PUT", uri: "/v1/assignments/" + req.params.id, statusCode: 400, message:"Request body is empty"});
        return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
      }
    if(!req.body.name || 
        !req.body.points || 
        !req.body.num_of_attempts || 
        !req.body.deadline ||
        (req.body.points && (req.body.points < 1 || typeof req.body.points=== 'string' || req.body.points > 100)) ||
        (req.body.num_of_attempts && (req.body.num_of_attempts < 1 || typeof req.body.num_of_attempts=== 'string' || req.body.num_of_attempts > 100)) || 
        (typeof req.body.name === 'number' || !isNaN(parseFloat(req.body.name)) && isFinite(req.body.name))||
        (typeof req.body.name === 'string' && req.body.name.trim() === '')  ||
        Object.keys(req.body).length > 4) {
            logger.error({method: "PUT", uri: "/v1/assignments/" + req.params.id, statusCode: 400, message:"Enter a valid request body"});
            return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }  
    
        let assignId = req.params.id;
        
      // Extract assignment ID from the request parameters

    try {
        const assignment = await db.assignment.findByPk(assignId); 

        // Check if the assignment exists
        if (!assignment) {
            logger.error({method: "PUT", uri: "/v1/assignments/" + req.params.id, statusCode: 404, message:"Assignment Already exists"});
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }

        const userId = req.user && req.user.id;
        if (!userId) {
            logger.error({method: "PUT", uri: "/v1/assignments/" + req.params.id, statusCode: 401, message: "Unauthorised user" });
            return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }

        //Check if the user has permission to update the assignment (depends on your use case)
         if (assignment.owner_user_id !== userId) {
            logger.error({method: "PUT", uri: "/v1/assignments/" + req.params.id, statusCode: 403, message: "Invalid, User does not have necessary permissions to Update"});
            return res.status(403).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
         }

        // Update the assignment
        await db.assignment.update({
            name: req.body.name,
            points: req.body.points,
            num_of_attempts: req.body.num_of_attempts,
            deadline: req.body.deadline
        }, {
            where: {
                id: assignId
            }
        });
        logger.info({method: "PUT", uri: "/v1/assignments/" + req.params.id, statusCode: 204, message: "Assignment Updated Successfully!!" });
        return res.status(204).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();  // Return 204 on successful update

    } catch (err) {
        logger.error({method: "PUT", uri: "/v1/assignments/" + req.params.id, statusCode: 500, message: "Server error" + err });
        return res.status(500).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();  // Use 500 for server errors
    }}
   

const deleteAssignment = async (req, res) => {

    helper.statsdClient.increment('DELETE_assigndetails');
    // So, make sure the user is authenticated and authorized to delete the assignment.
    const userId = req.user && req.user.id;  
    if (!userId) {
        logger.error({method: "DELETE", uri: "/v1/assignments/" + req.params.id, statusCode: 401, message: "Unauthorised user" });
        return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }


    if (req._body) {  
        logger.error({method: "DELETE", uri: "/v1/assignments/" + req.params.id, statusCode: 400, message:"Request body should be empty"});
        return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }

    const assignId = req.params.id;  // Extract assignment ID from the request parameters

    try {
        // First, check if the assignment exists
        const assignment = await db.assignment.findByPk(assignId);

        if (!assignment) {
            logger.error({method: "DELETE", uri: "/v1/assignments/" + req.params.id, statusCode: 404, message:"Assignment not found"});
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }

        // Check if the user has permission to delete the assignment
        if (assignment.owner_user_id !== userId) {
            logger.error({method: "DELETE", uri: "/v1/assignments/" + req.params.id, statusCode: 403, message: "Invalid, User does not have necessary permissions to Update"});
            return res.status(403).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
         }

        await db.assignment.destroy({
            where: {
                id: assignId

            }
        });
        logger.info({method: "DELETE", uri: "/v1/assignments/" + req.params.id, statusCode: 204, message: "Assignment Deleted Successfully!!" });
        return res.status(204).set('Cache-Control', 'no-store, no-cache, must-revalidate').send()  // Return 204 No Content on successful deletion

    } catch (err) {
        logger.error({method: "DELETE", uri: "/v1/assignments/" + req.params.id, statusCode: 500, message: "Server error" + err });
        return res.status(500).set('Cache-Control', 'no-store, no-cache, must-revalidate').send(); // Use 500 for server errors
    }
   
}

const getAssignmentList = async(req, res) => {

    helper.statsdClient.increment('GET_assignlist');

    if (req._body) {
        logger.error({method: "GET", uri: "/v1/assignments", statusCode: 400, message:"Request body should be empty"});
        return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }

    try {
        // Token validation and user attachment should be done in middleware
        const userId = req.user && req.user.id;  // Extract user ID from the token
        if (!userId) {
            logger.error({method: "GET", uri: "/v1/assignments", statusCode: 401, message: "Unauthorised user" });
            return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }
        const assignments = await db.assignment.findAll();  // This fetches all assignments

        if (!assignments || assignments.length === 0) {
            logger.error({method: "GET", uri: "/v1/assignments", statusCode: 404, message:"Assignment not found"});
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }


        // Mapping through assignments to format the response
        const result = assignments.map(assignment => ({
            id: assignment.id,
            name: assignment.name,
            points: assignment.points,
            num_of_attempts: assignment.num_of_attempts,
            deadline: assignment.deadline,
            assignment_created: assignment.assignment_created,
            assignment_updated: assignment.assignment_updated
           
        }));
        logger.info({method: "GET", uri: "/v1/assignments", statusCode: 200, message: "List of all Assignments is displayed successfully!!"});
        return res.status(200).set('Cache-Control', 'no-store, no-cache, must-revalidate').json(result); 
    }catch(err) {
        logger.error({method: "GET", uri: "/v1/assignments", statusCode: 500, message: "Server error" + err });
        res.status(500).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        
    }
}

const getAssignmentDetails = async(req, res) => {
    
    
    helper.statsdClient.increment('GET_assigndetails');

    if (req._body) {
        logger.error({method: "GET", uri: "/v1/assignments/" + req.params.id, statusCode: 400, message:"Request body should be empty"});
        return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }

    try {
        // Token validation and user attachment should be done in middleware
        const userId = req.user && req.user.id;  // Extract user ID from the token
        if (!userId) {
            logger.error({method: "GET", uri: "/v1/assignments/" + req.params.id, statusCode: 401, message: "Unauthorised user" });
            return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }

        let assignId = req.params.id;  // Extract assignment ID from the request parameters

        const assignment = await db.assignment.findByPk(assignId);  
            
        

        if (!assignment) {
            logger.error({method: "GET", uri: "/v1/assignments/" + req.params.id, statusCode: 404, message:"Assignment not found"});
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
        }
        
        const result = {
            id: assignment.dataValues.id,
            name: assignment.dataValues.name,
            points: assignment.dataValues.points,
            num_of_attempts: assignment.dataValues.num_of_attempts,
            deadline: assignment.dataValues.deadline,
            assignment_created: assignment.dataValues.assignment_created,
            assignment_updated: assignment.dataValues.assignment_updated,
        };
        logger.info({method: "GET", uri: "/v1/assignments/" + req.params.id, statusCode: 200, message: "The required assignment is displayed successfully!!"});
        return res.status(200).set('Cache-Control', 'no-store, no-cache, must-revalidate').json(result);
    } catch (err) {
        logger.error({method: "GET", uri: "/v1/assignments/" + req.params.id, statusCode: 500, message: "Server error" + err });
        return res.status(500).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }
}
    
    

module.exports = {
    createNewAssignment,
    deleteAssignment,
    getAssignmentList,
    putAssignmentDetails,
    getAssignmentDetails
    
}