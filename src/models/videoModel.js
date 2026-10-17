const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

let videos = null;

const initializevideosModel = () => {
    const sequelize = getSequelize();
    videos = sequelize.define('Videos', {
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

   

    return videos;
};

const getvideosModel = () => {
    if (!videos) {
        return initializevideosModel();
    }
    return videos;
};

module.exports = { getvideosModel, initializevideosModel };