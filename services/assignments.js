const helper = require('../config/helper');
const db = require('../config/dbSetup');

const createNewAssignment = async (req, res) => { // Create new Assignment function
    logger.info("Assignment Create (POST)");
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
            logger.info("Enter a Valid request");
            return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({
                message: "Bad request"
            });
        } 
        

    try{
        let assignmentObj = await db.assignment.findOne({where:{name:req.body.name}});
        if(assignmentObj) {
            logger.info("Assignment already exists");
            return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({
                message: "Bad request! Assignment already exists."
            });
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
        logger.info("Assignment Created Successfully!!");
        return res.status(201).set('Cache-Control', 'no-store, no-cache, must-revalidate').json(result);
    }catch(err) {
        logger.error("DB Error",err);
        console.log("DB Error ", err);
        res.status(500).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }
}

const putAssignmentDetails = async (req, res) => {  

    logger.info("Assignment Update (PUT)");
    helper.statsdClient.increment('PUT_assigndetails');
    
    const userId = req.user.id;
    if (!userId) {
        logger.info("Unauthorised user");
        return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Unauthorized' });
    }
    
    if (Object.keys(req.body).length === 0) {
        // Send 400 status if the body is empty
        logger.info("Request body is empty");
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
            logger.info("Bad request");
            return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({
                message: "Bad request"
            });
        }  
    
        let assignId = req.params.id;
        
      // Extract assignment ID from the request parameters

    try {
        const assignment = await db.assignment.findByPk(assignId); 

        // Check if the assignment exists
        if (!assignment) {
            logger.info("Assignment Already exists");
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: "Assignment not found" });
        }

        const userId = req.user && req.user.id;
        if (!userId) {
            logger.info("Unauthorised user");
            return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Unauthorized' });
        }

        //Check if the user has permission to update the assignment (depends on your use case)
         if (assignment.owner_user_id !== userId) {
            logger.info("Invalid User");
            return res.status(403).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Forbidden' });
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
        logger.info("Assignment Updated successfully!!");
        return res.status(204).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();  // Return 204 on successful update

    } catch (err) {
        logger.error("Database error",err);
        console.error("Database error: ", err);
        return res.status(500).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: "Internal server error" });  // Use 500 for server errors, not 400
    }}
   

const deleteAssignment = async (req, res) => {

    // So, make sure the user is authenticated and authorized to delete the assignment.
    const userId = req.user && req.user.id;  
    if (!userId) {
        return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Unauthorized' });
    }


    if (req._body) {  
        return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send("Bad Request");
    }

    const assignId = req.params.id;  // Extract assignment ID from the request parameters

    try {
        // First, check if the assignment exists
        const assignment = await db.assignment.findByPk(assignId);

        if (!assignment) {
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: "Assignment not found" });
        }

        // Check if the user has permission to delete the assignment
        if (assignment.owner_user_id !== userId) {
           return res.status(403).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Forbidden' });
         }

        await db.assignment.destroy({
            where: {
                id: assignId

            }
        });

        return res.status(204).set('Cache-Control', 'no-store, no-cache, must-revalidate').send()  // Return 204 No Content on successful deletion

    } catch (err) {
        console.error("Database error: ", err);
        return res.status(500).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: "Internal server error" }); // Use 500 for server errors
    }
   
}

const getAssignmentList = async(req, res) => {

    if (req._body) {
        return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }

    try {
        // Token validation and user attachment should be done in middleware
        const userId = req.user && req.user.id;  // Extract user ID from the token
        if (!userId) {
            return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Unauthorized' });
        }
        const assignments = await db.assignment.findAll();  // This fetches all assignments

        if (!assignments || assignments.length === 0) {
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'No assignments found' });
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
        return res.status(200).set('Cache-Control', 'no-store, no-cache, must-revalidate').json(result); 
    }catch(err) {
        res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send("Bad Request");
        console.log("DB Error ", err);
    }
}

const getAssignmentDetails = async(req, res) => {
    

    if (req._body) {
        return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send();
    }

    try {
        // Token validation and user attachment should be done in middleware
        const userId = req.user && req.user.id;  // Extract user ID from the token
        if (!userId) {
            return res.status(401).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: 'Unauthorized' });
        }

        let assignId = req.params.id;  // Extract assignment ID from the request parameters

        const assignment = await db.assignment.findByPk(assignId); //findOne({where: { id: assigntId}}); 
             // Added userId to the where clause for extra security
        

        if (!assignment) {
            return res.status(404).set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ message: "Assignment not found" });
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

        return res.status(200).set('Cache-Control', 'no-store, no-cache, must-revalidate').json(result);
    } catch (err) {
        console.error("Database error: ", err);
        return res.status(400).set('Cache-Control', 'no-store, no-cache, must-revalidate').send("Bad request !!");
    }
}
    
    

module.exports = {
    createNewAssignment,
    deleteAssignment,
    getAssignmentList,
    putAssignmentDetails,
    getAssignmentDetails
    
}