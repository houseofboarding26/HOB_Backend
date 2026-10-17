const { z, size } = require('zod');
const { PetTypes, amenities, bussinessType, property, propertyAreaType, hostStatus, Services } = require('../config/pets');

const AmenitiesEnum = z.enum(amenities);

const adminUpdateHostSchema = z.object({
    status: z.enum(hostStatus).optional(),
    accountSuspendReason: z.string().optional(),
    topRated: z.boolean().optional(),
    mostPopullar: z.boolean().optional(),
    physicalverification: z.boolean().optional()
});

const updateHostSchema = z.object({
    boardingOfPets: z.array(z.enum(PetTypes)).min(1),
    capacity: z.array(z.any()).min(1),
    numberOfRooms: z.record(z.any()),
    sizeOfRooms: z.array(z.any()).min(1),
    sizeOfCages: z.array(z.any()).min(1),
    pricePerPet: z.array(z.any()).min(1),
    Services: z.array(z.enum(Services)).min(1),
    amenities: z.array(AmenitiesEnum).optional(),
    paidAmenities: z.array(z.any()).min(1),
});

const createHostSchema = z.object({
    userId: z.string().uuid(),
    propertyName: z.string().min(2).max(100),
    address: z.object({
        street: z.string().min(1).optional(),
        area: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        pincode: z.string().min(4).max(10)
    }),
    about: z.string().optional(),
    bussinessType: z.enum(bussinessType),
    propertyType: z.enum(property),
    aboutBusiness: z.string().optional(),
    boardingOfPets: z.array(z.enum(PetTypes)).min(1),
    capacity: z.array(z.any()).min(1),
    numberOfRooms: z.record(z.any()),
    sizeOfRooms: z.array(z.any()).min(1),
    sizeOfCages: z.array(z.any()).optional(),
    pricePerPet: z.array(z.any()).min(1),
    Services: z.array(z.enum(Services)).min(1),
    nameOfBusiness: z.string().optional(),
    limitationsForGuests: z.number().int().min(0).optional(),
    propertyAreaSize: z.float32().optional(),
    numberOfCareTakers: z.number().int().min(1),
    experienceWithPets: z.string().min(5),
    rule: z.string().optional(),
    amenities: z.array(AmenitiesEnum).optional(),
    paidAmenities: z.array(z.any()).min(0),
});

module.exports = { createHostSchema, adminUpdateHostSchema, updateHostSchema };