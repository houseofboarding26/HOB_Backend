const { User: getUser } = require('../models/User');
const { Op, fn, col } = require('sequelize');
const { Customer: getCustomer } = require("../models/CustomerModel");
const { Booking: getBookingModel } = require('../models/bookingModel');
const { Host: getHost } = require('../models/HostModel');

const addUser = async (userData) => {
    try {
        const User = getUser();
        const user = await User.create(userData);
        return user.id;
    } catch (error) {
        console.error('Error adding user:', error.message);
        throw new Error('Error adding user');
    }
}

const getUsers = async (page = 1, limit = 10, name = '', email = '', hostStatus = '', role = '') => {
    const User = getUser();
    const Customer = getCustomer();
    const Booking = getBookingModel();
    const Host = getHost();

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (role) where.role = { [Op.eq]: `${role}` };

    const hostInclude = hostStatus
        ? {
            model: Host,
            as: 'host',
            attributes: ['id', 'status'],
            required: true,
            where: {
                status: hostStatus
            },
            include: [
                {
                    model: Booking,
                    as: 'bookings',
                    attributes: []
                }
            ]
        }
        : {
            model: Host,
            as: 'host',
            attributes: ['id', 'status'],
            required: false,
            include: [
                {
                    model: Booking,
                    as: 'bookings',
                    attributes: []
                }
            ]
        };

    const users = await User.findAll({
        where,
        include: [
            {
                model: Customer,
                as: 'customer',
                attributes: [],
                required: false,
                include: [
                    {
                        model: Booking,
                        as: 'bookings',
                        attributes: []
                    }
                ]
            },
            hostInclude
        ],
        order: [['createdAt', 'DESC']],
        attributes: [
            'id',
            'name',
            'email',
            'role',
            'createdAt',
            [
                fn(
                    'COUNT',
                    fn('DISTINCT', col('customer->bookings.id'))
                ),
                'bookingCount'
            ],

            [
                fn(
                    'COUNT',
                    fn('DISTINCT', col('host->bookings.id'))
                ),
                'hostBookingCount'
            ],
            [col('host.status'), 'hostStatus'],
            [col('host.propertyName'), 'propertyName']
        ],
        group: ['User.id', 'host.id', 'host.status', 'host.propertyName'],
        limit,
        offset,
        subQuery: false
    });

    const countInclude = hostStatus ? [hostInclude] : [];
    const total = await User.count({ where, include: countInclude, distinct: true });

    const roleCountsRaw = await User.findAll({
        where,
        include: countInclude,
        attributes: [
            'role',
            [fn('COUNT', col('User.id')), 'count']
        ],
        group: ['role'],
        raw: true
    });

    const roleCounts = {
        customer: 0,
        host: 0,
        admin: 0
    };

    roleCountsRaw.forEach(item => {
        if (item.role) {
            roleCounts[item.role] = parseInt(item.count, 10);
        }
    });

    const data = users.map(u => {
        const obj = u.toJSON();
        obj.bookingCount = parseInt(obj.bookingCount || 0, 10);
        obj.hostStatus = obj.hostStatus ?? (obj.host ? obj.host.status : null);
        if (!obj.host) delete obj.host;
        return obj;
    });

    return {
        data,
        total,
        roleCounts,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

const getUserById = async (userId) => {
    const User = getUser();
    const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'googleId', 'avatar', 'role']
    });
    return user;
}

const getUserByEmailService = async (email) => {
    const User = getUser();

    return await User.findOne({
        where: { email },
        attributes: [
            'id',
            'name',
            'email',
            'googleId',
            'avatar',
            'role',
            'password'
        ]
    });
};

const updateUserPasswordService = async (password, userId) => {
    try {
        const User = getUser();

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        await User.update({ password }, { where: { id: userId } });
        await user.save();
    } catch (error) {
        throw new Error('Error updating user role');
    }
}

const updateUserRoleService = async (role, userId) => {
    try {
        const User = getUser();

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        await User.update({ role }, { where: { id: userId } });
        await user.save();
    } catch (error) {
        CONSOLE.log('USER DETAILS:', user);
        console.error('Error updating user role:', error);
        throw new Error('Error updating user role');
    }
}

module.exports = { addUser, getUsers, getUserById, getUserByEmailService, updateUserPasswordService, updateUserRoleService };