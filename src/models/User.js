const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

let User = null;

const initializeUser = () => {
  const sequelize = getSequelize();

  User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      required: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('customer', 'host', 'admin'),
      allowNull: false,
      defaultValue: 'customer'
    },
    avatar: {
      type: DataTypes.STRING,
      required: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return User;
};

const getUser = () => {
  if (!User) {
    return initializeUser();
  }
  return User;
};

module.exports = { User: getUser, initializeUser };