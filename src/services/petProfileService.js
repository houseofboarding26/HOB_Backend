const { Op } = require('sequelize');
const { PetProfile: getPetProfileModel } = require('../models/petProfileModel');

const addPetProfileService = async (petProfileData) => {
    const PetProfile = getPetProfileModel();
    const petProfile = await PetProfile.create(petProfileData);
    return petProfile.id;
}

const getPetProfilesService = async (page = 1, limit = 10, name = '', email = '', userId) => {
    const PetProfile = getPetProfileModel();
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) {
        where.userId = { [Op.like]: `%${userId}%` };
    }
    if (name) {
        where.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
        where.email = { [Op.like]: `%${email}%` };
    }
    const { count, rows } = await PetProfile.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset
    });

    return {
        data: rows,
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit)
    };
}

const getPetProfileByIdService = async (petProfileId) => {
    const PetProfile = getPetProfileModel();
    const petProfile = await PetProfile.findByPk(petProfileId);
    return petProfile;
}

const updatePetProfileService = async (
    petProfileId,
    petProfileData
) => {
    const {
        name,
        contactNumber,
        email,
        addressPet,
        petName,
        petAge,
        petSize,
        vacinationdate,
        tickTreatmentStatus,
        healthIssues,
        healthIssuesDescription,
        medicalHistory,
        medicalHistoryDescription,
        behavioralIssues,
        behavioralIssuesDescription
    } = petProfileData;

    const petData = {
        name,
        contactNumber,
        email,
        addressPet,
        petName,
        petAge,
        petSize,
        vacinationdate,
        tickTreatmentStatus,
        healthIssues,
        healthIssuesDescription,
        medicalHistory,
        medicalHistoryDescription,
        behavioralIssues,
        behavioralIssuesDescription
    };
    const PetProfile = getPetProfileModel();
    const petProfile = await PetProfile.findByPk(
        petProfileId
    );
    if (!petProfile) {
        throw new Error('Pet profile not found');
    }
    await petProfile.update(petData);
    return petProfile;
};

module.exports = { addPetProfileService, getPetProfilesService, getPetProfileByIdService, updatePetProfileService };