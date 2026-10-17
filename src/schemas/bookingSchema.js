const { z } = require("zod");
const { bookingType, amenities, bookingStatus } = require("../config/pets");

const AmenitySchema = z.object({
    amenity: z.enum(amenities),
    price: z.number().min(0, "Price must be a non-negative number")
});

const createBookingSchema = z.object({
    petIds: z.array(z.string().uuid()).min(1),
    hostId: z.string().uuid(),
    status: z.enum(bookingStatus).optional(),
    checkIn: z.coerce.date().refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkIn = new Date(date);
        checkIn.setHours(0, 0, 0, 0);
        return checkIn >= today;
    }, {
        message: "Check-in date cannot be in the past."
    }),
    checkOut: z.coerce.date(),
    bookingType: z.enum(bookingType),
    instructions: z.string().optional(),
    cancellationProtection: z.boolean().optional(),
    amenities: z.array(AmenitySchema).optional(),
    emergencyBoardingPrice: z.number().min(0, "Emergency boarding price must be a non-negative number").optional()
}).superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOut = new Date(data.checkOut);
    checkOut.setHours(0, 0, 0, 0);
    if (checkOut < today) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["checkOut"],
            message: "Check-out date cannot be in the past."
        });
    }
    if (checkOut <= data.checkIn) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["checkOut"],
            message: "Check-out date must be after check-in date."
        });
    }
});

module.exports = { createBookingSchema };