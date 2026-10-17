const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");
const { User: getUser } = require('./User');
const { PetTypes, petGender, petSize } = require("../config/pets");


let petProfileModel = null;

const initializePetProfileModel = () => {
    const sequelize = getSequelize();
    const User = getUser();

    petProfileModel = sequelize.define('PetProfile', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
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
        contactNumber: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        addressPet: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false
        },
        petType: {
            type: DataTypes.ENUM(...PetTypes),
            allowNull: false
        },
        petName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        petAge: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        colorAndMarkings: {
            type: DataTypes.STRING,
            allowNull: true
        },
        breed: {
            type: DataTypes.STRING,
            allowNull: true
        },
        petGender: {
            type: DataTypes.ENUM(...petGender),
            allowNull: false
        },
        petSize: {
            type: DataTypes.ENUM(...petSize),
            allowNull: true
        },
        vacinationdate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        tickTreatmentStatus: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        healthIssues: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        healthIssuesDescription: {
            type: DataTypes.STRING,
            allowNull: true
        },
        medicalHistory: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        medicalHistoryDescription: {
            type: DataTypes.STRING,
            allowNull: true
        },
        behavioralIssues: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        behavioralIssuesDescription: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
    petProfileModel.belongsTo(User, { foreignKey: "userId", as: "user", });
    User.hasMany(petProfileModel, { foreignKey: "userId", as: "petProfiles", });
    return petProfileModel;
}

const getPetProfileModel = () => {
    if (!petProfileModel) {
        return initializePetProfileModel();
    }
    return petProfileModel;
};

module.exports = { PetProfile: getPetProfileModel, initializePetProfileModel };