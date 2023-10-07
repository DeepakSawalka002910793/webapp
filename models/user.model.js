const { DataTypes } = require("sequelize");

const createUserModel = (sequelize) => {
    let User = sequelize.define("user", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4, // Automatically generate a UUID
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        account_created: {
            type: DataTypes.DATE,
            allowNull: false
        },
        account_updated: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        updatedAt: 'account_updated',
        createdAt: 'account_created',
    },
    {
        initialAutoIncrement: 1,
    });

    return User;
}

module.exports = createUserModel;