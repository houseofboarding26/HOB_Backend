const { getHostHolidaysService, getHostHolidaysByHostIdService, addHostHolidayService } = require("../services/HostHoliday");
const { getHostByUserIDService } = require("../services/hostService");

const getHostHolidayController = async (req, res) => {
    try {
        const { page, limit, hostName, fromDate, toDate, hostId, userId } = req.query;
        const hostHolidays = await getHostHolidaysService(
            page,
            limit,
            hostName,
            fromDate,
            toDate,
            hostId,
            userId
        );
        res.json(hostHolidays);
    } catch (error) {
        console.error('Error in getHostHoliday Controller:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getHostHolidayByIdController = async (req, res) => {
    try {
        const Id = req.params.id;
        const hostHoliday = await getHostHolidaysByHostIdService(Id);
        if (!hostHoliday) {
            return res.status(404).json({
                success: false,
                error: 'Host holiday not found'
            });
        }
        res.json(hostHoliday);
    } catch (error) {
        console.error('Error in getHostHolidayById Controller:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const postHostHolidayController = async (req, res) => {
    try {
        const userId = req.user.id;
        const host = await getHostByUserIDService(userId);
        if (!host) {
            return res.status(400).json({
                success: false,
                error: 'User is not a host'
            });
        }
        req.body.hostId = host.id;
        req.body.hostName = host.propertyName;
        const hostHolidayId = await addHostHolidayService(req.body);
        res.status(201).json({
            message: 'Host holiday created successfully',
            success: true,
            HostHolidayId: hostHolidayId
        });
    } catch (error) {
        console.error('Error in postHostHoliday Controller:', error.message);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};


module.exports = { getHostHolidayController, getHostHolidayByIdController, postHostHolidayController };