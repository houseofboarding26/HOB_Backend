const { getvideosModel } = require("../models/videoModel");

const addVideoService = async (data) => {
    const video = getvideosModel();
    const newVideo = await video.create(data);
    return newVideo;
}

const getAllvideosService = async (page = 1, limit = 10) => {
    const video = getvideosModel();
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;
    const { count, rows } = await video.findAndCountAll({
        limit,
        order: [['createdAt', 'DESC']],
        offset
    });

    return {
        data: rows,
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit)
    };
};

const deletevideosService = async (videoId) => {
    const video = getvideosModel();
    const deletedvideo = await video.destroy({
        where: { id: videoId }
    });
    return deletedvideo;
}

module.exports = {
    addVideoService,
    getAllvideosService,
    deletevideosService
};