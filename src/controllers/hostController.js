const { getHostsService, addHostService, getHostByIdService, getHostByUserIDService, getHostForAdminsService, updateHostService, updateHostPropertyService } = require("../services/hostService");
const { updateUserRoleService } = require("../services/userService");
const { Host: getHost } = require("../models/HostModel");
const { HostHoliday: getHostHolidayModel } = require('../models/HostHolidayModel');
const { Op } = require("sequelize");


const getHosts = async (req, res) => {
    try {
        const {
            page,
            limit,
            name,
            email,
            address,
            nameOfBusiness,
            boardingOfPets,
            amenities,
            status,
            bussinessType,
            minPrice,
            maxPrice
        } = req.query;
        const hosts = await getHostsService(
            page,
            limit,
            name,
            email,
            address,
            nameOfBusiness,
            boardingOfPets,
            amenities,
            status,
            bussinessType,
            minPrice,
            maxPrice
        );


        res.json(hosts);
    } catch (error) {
        console.error('Error in get Hosts controller:', error);
        res.status(500).json({ error: error.message });
    }
};

const getHostsforAdmin = async (req, res) => {
    try {
        const {
            page,
            limit,
            name,
            email,
            address,
            nameOfBusiness,
            boardingOfPets,
            amenities,
            status
        } = req.query;
        const hosts = await getHostForAdminsService(
            page,
            limit,
            name,
            email,
            address,
            nameOfBusiness,
            boardingOfPets,
            amenities,
            status);

        res.json(hosts);
    } catch (error) {
        console.error('Error in get Hosts controller:', error);
        res.status(500).json({ error: error.message });
    }
};

const getHostById = async (req, res) => {
    try {
        const hostId = req.params.id;
        const host = await getHostByIdService(hostId);
        if (!host) {
            return res.status(404).json({ error: 'Host not found' });
        }
        res.json(host);
    } catch (error) {
        console.error('Error in get HostById controller:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const postHosts = async (req, res) => {
    try {
        const hostId = await addHostService(req.body);
        await updateUserRoleService("host", req.body.userId);
        res.status(201).json({
            message: 'Host created successfully',
            success: true,
            HostId: hostId
        });
    } catch (error) {
        console.error('Error in post Hosts controller:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

const putHosts = async (req, res) => {
    try {
        const { id } = req.params
        const hostdata = await getHostByIdService(id)
        if (!hostdata) {
            return res.json({ message: "user account not exist" })
        }
        const hostId = await updateHostService(req, res);
        res.status(201).json({
            message: 'Host successfully updated',
            success: true,
            HostId: hostId
        });
    } catch (error) {
        console.error('Error in put Host controller:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

const putHostProperty = async (req, res) => {
    try {
        const { id } = req.params
        const hostdata = await getHostByIdService(id)
        if (!hostdata) {
            return res.json({ message: "Host account not exist" })
        }
        const hostId = await updateHostPropertyService(req, res);
        res.status(201).json({
            message: 'Host property successfully updated',
            success: true,
            HostId: hostId
        });
    } catch (error) {
        console.error('Error in put Host controller:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

const updateHostHolidayStatusService = async (req, res) => {
    const Host = getHost();
    const HostHoliday = getHostHolidayModel();
    const now = new Date();
    console.log('Host holiday status cron run at: ' + now);
    try {
        const activeHolidays = await HostHoliday.findAll({
            where: {
                fromDate: {
                    [Op.lte]: now
                },
                toDate: {
                    [Op.gte]: now
                }
            },
            attributes: [
                "hostId",
                "fromDate",
                "toDate",
                "reason"
            ]
        });

        let suspendedCount = 0;
        for (const holiday of activeHolidays) {
            const [updatedRows] = await Host.update(
                {
                    status: "suspend",
                    accountSuspendReason:
                        `Host holiday: ${holiday.reason || "Holiday"}`
                },
                {
                    where: {
                        id: holiday.hostId,
                        status: "verified"
                    }
                }
            );

            suspendedCount += updatedRows;
        }

        const expiredHolidays = await HostHoliday.findAll({
            where: {
                toDate: {
                    [Op.lt]: now
                }
            },
            attributes: [
                "hostId"
            ]
        });

        let verifiedCount = 0;
        for (const holiday of expiredHolidays) {
            const [updatedRows] = await Host.update(
                {
                    status: "verified",
                    accountSuspendReason: null
                },
                {
                    where: {
                        id: holiday.hostId,
                        status: "suspend",
                        accountSuspendReason: {
                            [Op.like]: "Host holiday:%"
                        }
                    }
                }
            );
            verifiedCount += updatedRows;
        }
        console.log('Host holiday status cron completed:', {
            suspendedCount,
            verifiedCount,
            currentTime: now
        });
        return res.json({
            message: "Host holiday status update completed.",
            success: true,
            suspendedCount,
            verifiedCount
        });

    } catch (error) {
        console.error(
            "Host holiday status update error:",
            error
        );
        res.status(500).json({
            error: "Internal Server Error",
            success: false,
            message: error.message
        });
    }
};


module.exports = { getHosts, getHostById, postHosts, getHostsforAdmin, putHosts, putHostProperty, updateHostHolidayStatusService };