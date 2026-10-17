const { default: z } = require("zod");


const createHostHolidaySchema = z.object({
    fromDate: z.coerce.date(),
    toDate: z.coerce.date(),
    reason: z.string().min(5, "Reason must be at least 5 characters long").optional()
}).superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = new Date(data.fromDate);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(data.toDate);
    toDate.setHours(0, 0, 0, 0);
    if (fromDate < today) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['fromDate'],
            message: 'Start date cannot be in the past.'
        });
    }
    if (toDate < today) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['toDate'],
            message: 'End date cannot be in the past.'
        });
    }
    if (toDate < fromDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['toDate'],
            message: 'End date cannot be before start date.'
        });
    }
});

module.exports = { createHostHolidaySchema };