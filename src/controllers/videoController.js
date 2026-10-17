const { addVideoService, getAllvideosService, deletevideosService } = require("../services/videoService")

const addVideoController = async (req, res) => {
    try {
        const videoId = await addVideoService(req.body);
        res.status(201).json({
            message: 'video url added successfully',
            success: true,
            videoId: videoId
        });

    } catch (error) {
        console.error('Error in add video Controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
}

const getvideoController = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const videodata = await getAllvideosService(page, limit);
        res.json(videodata);
    } catch (error) {
        console.error('Error in get video Controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
}

const deletevideoController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new Error("kindly pass video id in query params")
        }

        const videodata = await deletevideosService(id);
        if (videodata == 0) {
            throw new Error('video not found by this id')
        }
        res.json({
            success: true,
            data: videodata,
            message: "video deleted successfully"
        });
    } catch (error) {
        console.error('Error in get video Controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
}

module.exports = { addVideoController, getvideoController, deletevideoController }