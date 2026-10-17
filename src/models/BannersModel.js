const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

let Banners = null;

const initializeBannersModel = () => {
    const sequelize = getSequelize();
    Banners = sequelize.define('Banners', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

   

    return Banners;
};

const getBannersModel = () => {
    if (!Banners) {
        return initializeBannersModel();
    }
    return Banners;
};

module.exports = { getBannersModel, initializeBannersModel };