const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');
const { User: getUser } = require('./User');
const { behavioralIssues, PetTypes } = require('../config/pets');

let Customer = null;

const initializeCustomer = () => {
    const sequelize = getSequelize();
    const User = getUser();

    Customer = sequelize.define('Customer', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            unique: true,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        name: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
    Customer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasOne(Customer, { foreignKey: 'userId', as: 'customer' });
    return Customer;
};

const getCustomer = () => {
    if (!Customer) {
        return initializeCustomer();
    }
    return Customer;
};

module.exports = { Customer: getCustomer, initializeCustomer };