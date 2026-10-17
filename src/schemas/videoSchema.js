const { z, size, url } = require('zod');

const addVideoSchema = z.object({
    title: z.string().min(2, { message: "minimum length should be 2 characters" }),
    url: z.string().url({ message: "kindly provide proper url formate" })
});

module.exports = { addVideoSchema };