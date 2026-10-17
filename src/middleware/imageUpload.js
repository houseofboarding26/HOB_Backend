const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadImageToCloudinary = async (req, res, next) => {
    try {
        console.log(req)
        if (!req.file) {
            console.log('no image attached')
            return next();
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "banner",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        req.body.url = result.secure_url;
        req.body.imagePublicId = result.public_id;
        console.log(req.body, result)
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Image upload failed",
            error: error.message,
        });
    }
};

module.exports = uploadImageToCloudinary;