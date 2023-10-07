const { DataTypes } = require("sequelize");

const createAssignmentModel = (sequelize) => {
    let Assignment = sequelize.define("assignment", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4, // Automatically generate a UUID
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 100
            }

        },
        num_of_attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 100
            }
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        
        assignment_created: {
            type: DataTypes.DATE,
            allowNull: false
        },
        assignment_updated: {
            type: DataTypes.DATE,
            allowNull: false
        },
        owner_user_id: {
            type: DataTypes.UUID,
            allowNull: false
        }
    },
    {
        updatedAt: 'assignment_updated',
        createdAt: 'assignment_created',
    },
    );

    return Assignment;
}

module.exports = createAssignmentModel;