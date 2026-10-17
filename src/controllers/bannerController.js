const { addBannerService, getAllBannersService, deleteBannersService } = require("../services/BannersService");

const addBannerController = async (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json({
                success: false,
                message: "banner title can not be empty"
            })
        }
        if (!req.body.url) {
            res.status(400).json({
                success: false,
                message: "banner url can not be empty"
            })
        }
        const BannerId = await addBannerService(req.body);
        res.status(201).json({
            message: 'Banner url added successfully',
            success: true,
            BannerId: BannerId
        });

    } catch (error) {
        console.error('Error in add Banner Controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
}

const getBannerController = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const Bannerdata = await getAllBannersService(page, limit);
        res.json(Bannerdata);
    } catch (error) {
        console.error('Error in get Banner Controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
}

const deleteBannerController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new Error("kindly pass Banner id in query params")
        }

        const Bannerdata = await deleteBannersService(id);
        if (Bannerdata == 0) {
            throw new Error('Banner not found by this id')
        }
        res.json({
            success: true,
            data: Bannerdata,
            message: "Banner deleted successfully"
        });
    } catch (error) {
        console.error('Error in get Banner Controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
}

module.exports = { addBannerController, getBannerController, deleteBannerController }