const { z, size } = require('zod');
const { PetTypes, amenities, petSize, petGender } = require('../config/pets');


const createPetProfileSchema = z.object({
    name: z.string().min(2).max(100),
    contactNumber: z.string().regex(/^[0-9]{10,15}$/),
    email: z.string().email(),
    addressPet: z.string().min(5).max(255),
    petType: z.enum(PetTypes),
    petName: z.string().min(1).max(100),
    petAge: z.float32().min(0),
    colorAndMarkings: z.string().optional(),
    breed: z.string().optional(),
    petGender: z.enum(petGender),
    petSize: z.enum(petSize).optional(),
    vacinationdate: z.string().datetime().optional(),
    tickTreatmentStatus: z.boolean().optional(),
    healthIssues: z.boolean().optional(),
    healthIssuesDescription: z.string().optional(),
    medicalHistory: z.boolean().optional(),
    medicalHistoryDescription: z.string().optional(),
    behavioralIssues: z.boolean().optional(),
    behavioralIssuesDescription: z.string().optional()
}).superRefine((data, ctx) => {
    if (data.healthIssues && !data.healthIssuesDescription) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["healthIssuesDescription"],
            message: "Health issues description is required."
        });
    }

    if (data.medicalHistory && !data.medicalHistoryDescription) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["medicalHistoryDescription"],
            message: "Medical history description is required."
        });
    }

    if (data.behavioralIssues && !data.behavioralIssuesDescription) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["behavioralIssuesDescription"],
            message: "Behavioral issues description is required."
        });
    }
});

const updatePetProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    contactNumber: z.string().regex(/^[0-9]{10,15}$/).optional(),
    email: z.string().email().optional(),
    addressPet: z.string().min(5).max(255).optional(),
    petName: z.string().min(1).max(100).optional(),
    petAge: z.number().min(0).optional(),
    petSize: z.enum(petSize).optional(),
    vacinationdate: z.string().datetime().optional(),
    tickTreatmentStatus: z.boolean().optional(),
    healthIssues: z.boolean().optional(),
    healthIssuesDescription: z.string().optional(),
    medicalHistory: z.boolean().optional(),
    medicalHistoryDescription: z.string().optional(),
    behavioralIssues: z.boolean().optional(),
    behavioralIssuesDescription: z.string().optional()
});

module.exports = { createPetProfileSchema, updatePetProfileSchema };