const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { upload } = require("./upload");
const multer = require("multer");

const uploadFileHostGallery = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "host-gallery",
                resource_type: "auto",
            },
            (error, result) => {
                if (error) return reject(error);

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    type: result.resource_type,
                    format: result.format,
                });
            }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

const uploadFileforhostverification = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "host-Id-proofs",
                resource_type: "auto",
            },
            (error, result) => {
                if (error) return reject(error);

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    type: result.resource_type,
                    format: result.format,
                });
            }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

const uploadHostfiles = async (req, res, next) => {
    try {

        if (!req.files) {
            console.log('no file attached')
            return next();
        }

        if (req.files.noc?.length) {
            const results = await Promise.all(
                req.files.noc.map(uploadFileforhostverification)
            );
            req.body.noc = results.map(file => file.url);
        }

        if (req.files.idProof?.length) {
            const results = await Promise.all(
                req.files.idProof.map(uploadFileforhostverification)
            );
            req.body.idProof = results.map(file => file.url);
        }

        if (req.files.addressProof?.length) {
            const results = await Promise.all(
                req.files.addressProof.map(uploadFileforhostverification)
            );
            req.body.addressProof = results.map(file => file.url);
        }

        if (req.files.propertyPhotos?.length) {
            const results = await Promise.all(
                req.files.propertyPhotos.map(uploadFileHostGallery)
            );
            const existingPhotos = req.body.propertyPhotos || [];

            req.body.propertyPhotos = [
                ...(Array.isArray(existingPhotos) ? existingPhotos : [existingPhotos]),
                ...results.map(file => file.url)
            ];
        }

        if (req.files.businessProof?.length) {
            const results = await Promise.all(
                req.files.businessProof.map(uploadFileforhostverification)
            );
            req.body.businessProof = results.map(file => file.url);
        }

        if (req.files.banner?.length) {
            const results = await Promise.all(
                req.files.banner.map(uploadFileforhostverification)
            );
            req.body.url = results[0].url;
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const handleHostUpload = (req, res, next) => {
    const uploadHostFiles = upload.fields([
        { name: 'noc', maxCount: 2 },
        { name: 'propertyPhotos', maxCount: 100 },
        { name: 'idProof', maxCount: 2 },
        { name: 'addressProof', maxCount: 2 },
        { name: 'businessProof', maxCount: 3 }
    ]);

    const fileLimits = {
        noc: 2,
        propertyPhotos: 100,
        idProof: 2,
        addressProof: 2,
        businessProof: 3
    };
    uploadHostFiles(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);

            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    const field = err.field;

                    return res.status(400).json({
                        success: false,
                        message: `${field} can contain maximum ${fileLimits[field]} files`
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            return res.status(500).json({
                success: false,
                message: err.message || 'File upload failed'
            });
        }

        next();
    });
};

const updateHostFiles = (req, res, next) => {
    if (!req.files) {
        // return next();
    }
    const uploadHostFiles = upload.fields([
        { name: 'propertyPhotos', maxCount: 100 }
    ]);

    const fileLimits = {
        propertyPhotos: 100
    };
    uploadHostFiles(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);

            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    const field = err.field;

                    return res.status(400).json({
                        success: false,
                        message: `${field} can contain maximum ${fileLimits[field]} files`
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            return res.status(500).json({
                success: false,
                message: err.message || 'File upload failed'
            });
        }
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    });
};

const addBannnerFiles = (req, res, next) => {
    if (!req.files) {
        // return next();
    }
    const uploadHostFiles = upload.fields([
        { name: 'banner', maxCount: 1 }
    ]);

    const fileLimits = {
        banner: 1
    };
    uploadHostFiles(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);

            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    const field = err.field;

                    return res.status(400).json({
                        success: false,
                        message: `${field} can contain maximum ${fileLimits[field]} files`
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            return res.status(500).json({
                success: false,
                message: err.message || 'File upload failed'
            });
        }
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    });
};

module.exports = { uploadHostfiles, handleHostUpload, updateHostFiles, addBannnerFiles };