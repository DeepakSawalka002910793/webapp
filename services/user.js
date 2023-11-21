const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../config/dbSetup');
const helper = require('../config/helper');
const logger = require('../logger/loggerindex');
const dotenv = require('dotenv');
dotenv.config();

// Main function to add new users from CSV to the database
const newUser = async (req, res) => {
    const csvFilePath = process.env.CSV_PATH;

    // Read the CSV file
    const file = fs.createReadStream(csvFilePath);

    // Parse the CSV data
    Papa.parse(file, {
        header: true,
        dynamicTyping: true, // Added to automatically convert data types
        complete: async (result) => {
            // Iterate over each row in the CSV
            for (const row of result.data) {
                const { first_name, last_name, email, password } = row;

                // Validate user data
                if (!first_name || !last_name || !email || !password ) {
                    logger.error({statusCode: 400, message: "Enter Valid User data"});
                    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
                    return res.status(400).send();
                }

                // Check if the user already exists
                const existingUser = await db.user.findOne({ where: { email }});
                if (existingUser) {
                    logger.info({message: "User with the same email already exists"});  // Logging for debugging
                    continue;  // Skip to the next iteration
                }

                // Hash the password
                let hashedPassword = await helper.createPassHash(password);

                // Create new user
                try {
                    await db.user.create({
                        first_name,
                        last_name,
                        email,
                        password: hashedPassword,
                        account_created: new Date(),
                        account_updated: new Date()
                    });
                    logger.info({statusCode: 201, message:"User added successfully."}); // Logging for debugging
                      
            
                } catch (err) {
                    logger.error({statusCode: 500, message:"DB error" + err});
                    return res.status(500).send();
                }
            }
           
            
            // Send a response when done
            res.status(201).json({
                message: 'Users added successfully'
            }); 
        }
    });
}


module.exports = {
    newUser 
};