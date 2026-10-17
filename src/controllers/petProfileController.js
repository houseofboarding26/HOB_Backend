const { getPetProfilesService, getPetProfileByIdService, addPetProfileService, updatePetProfileService } = require("../services/petProfileService");


const getPetProfileController = async (req, res) => {
    try {
        const { page, limit, name, email, userId } = req.query;
        const petProfiles = await getPetProfilesService(page, limit, name, email, userId);
        res.json(petProfiles);
    } catch (error) {
        console.error('Error in getPetProfile Controller:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

const getPetProfileByIdController = async (req, res) => {
    try {
        const petProfileId = req.params.id;
        const petProfile = await getPetProfileByIdService(petProfileId);
        if (!petProfile) {
            return res.status(404).json({ error: 'Pet profile not found' });
        }
        res.json(petProfile);
    } catch (error) {
        console.error('Error in getPetProfileById Controller:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

const postPetProfileController = async (req, res) => {
    const userId = req.user.id;
    req.body.userId = userId;
    try {
        const petProfileId = await addPetProfileService(req.body);
        res.status(201).json({
            message: 'Pet profile created successfully',
            success: true,
            PetProfileId: petProfileId
        });
    } catch (error) {
        console.error('Error in postPetProfile Controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

const updatePetProfileController = async (req, res) => {
    const { petProfileId } = req.params;
    const { name,
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
        behavioralIssuesDescription } = req.body;
    try {
        const updatedPetProfile = await updatePetProfileService(petProfileId, req.body);
        res.json({
            message: 'Pet profile updated successfully',
            success: true,
            petProfile: updatedPetProfile
        });
    } catch (error) {
        console.error('Error in updatePetProfile Controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

module.exports = { getPetProfileController, getPetProfileByIdController, postPetProfileController, updatePetProfileController };