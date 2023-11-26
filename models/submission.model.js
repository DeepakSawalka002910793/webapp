const { DataTypes } = require("sequelize");

const createSubmissionModel = (sequelize) => {
    let Submission = sequelize.define("submission", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4, // Automatically generate a UUID
            allowNull: false
        },
        assignment_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        submission_url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true 
            }    
        },
        submission_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        submission_updated: {
            type: DataTypes.DATE,
            allowNull: false
        }
        
    },
    {
        submittedAt: 'submission_date',
        updatedAt: 'submission_updated',
        timestamps: false,
    },
    );

    return Submission;
}

module.exports = createSubmissionModel;