const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../config/dbSetup');
const helper = require('../config/helper');


// Main function to add new users from CSV to the database
const newUser = async (req, res) => {
    const csvFilePath = process.env.CSV_FILE_PATH;

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
                    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
                    return res.status(400).json({
                        message: "Bad request"
                    });
                }

                // Check if the user already exists
                const existingUser = await db.user.findOne({ where: { email }});
                if (existingUser) {
                    console.log('User with the same email already exists.'); // Logging for debugging
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
                    console.log('User added successfully.');  // Logging for debugging
            
                } catch (err) {
                    console.error("DB Error", err);  // Changed to console.error for error logging
                    return res.status(500).json({
                        message: "Internal server error",
                        error: err.message  // Added specific error message for better debugging
                    });
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