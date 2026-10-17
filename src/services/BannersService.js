const { getBannersModel } = require("../models/BannersModel");

const addBannerService = async (data) => {
    const Banner = getBannersModel();
    const newBanner = await Banner.create(data);
    return newBanner;
}

const getAllBannersService = async (page = 1, limit = 10) => {
    const Banner = getBannersModel();
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;
    const { count, rows } = await Banner.findAndCountAll({
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

const deleteBannersService = async (BannerId) => {
    const Banner = getBannersModel();
    const deletedBanner = await Banner.destroy({
        where: { id: BannerId }
    });
    return deletedBanner;
}

module.exports = {
    addBannerService,
    getAllBannersService,
    deleteBannersService
};