const { Op } = require('sequelize');
const { HostHoliday: getHostHolidayModel } = require('../models/HostHolidayModel');



const addHostHolidayService = async (holidayData) => {
    const HostHoliday = getHostHolidayModel();

    const {
        hostId,
        fromDate,
        toDate,
        hostName,
        reason
    } = holidayData;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    const existingHoliday = await HostHoliday.findOne({
        where: {
            hostId,
            [Op.and]: [
                {
                    fromDate: {
                        [Op.lte]: endDate
                    }
                },
                {
                    toDate: {
                        [Op.gte]: startDate
                    }
                }
            ]
        }
    });

    if (existingHoliday) {
        throw new Error(
            `Holiday already exists for this period: ` +
            `${existingHoliday.fromDate.toISOString().split("T")[0]} ` +
            `to ` +
            `${existingHoliday.toDate.toISOString().split("T")[0]}`
        );
    }
    const holiday = await HostHoliday.create({
        hostId,
        hostName,
        fromDate: startDate,
        toDate: endDate,
        reason
    });
    return holiday.id;
};

const getHostHolidaysService = async (
    page = 1,
    limit = 10,
    hostName = '',
    fromDate = '',
    toDate = '',
    hostId
) => {
    try {
        const HostHoliday = getHostHolidayModel();
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const where = {};
        if (hostId) {
            where.hostId = hostId;
        }
        if (hostName) {
            where.hostName = { [Op.iLike]: `%${hostName}%` };
        }
        if (fromDate) {
            const startDate = new Date(`${fromDate}T00:00:00.000Z`);
            if (Number.isNaN(startDate.getTime())) {
                throw new Error('fromDate must be a valid date');
            }
            const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
            where.fromDate = { [Op.gte]: startDate, [Op.lt]: endDate };
        }
        if (toDate) {
            const startDate = new Date(`${toDate}T00:00:00.000Z`);
            if (Number.isNaN(startDate.getTime())) {
                throw new Error('toDate must be a valid date');
            }
            const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
            where.toDate = { [Op.gte]: startDate, [Op.lt]: endDate };
        }
        const { count, rows } = await HostHoliday.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        return {
            data: rows,
            total: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit)
        }
    }
    catch (error) {
        console.error('Error in getHostHolidaysService:', error.message);
        throw new Error('Failed to retrieve host holidays');

    };
}

const getHostHolidaysByHostIdService = async (hostId) => {
    const HostHoliday = getHostHolidayModel();
    const id = hostId;
    const row = await HostHoliday.findByPk(id);
    return row;
}


module.exports = { addHostHolidayService, getHostHolidaysService, getHostHolidaysByHostIdService };