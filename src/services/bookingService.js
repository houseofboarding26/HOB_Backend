const { Op } = require('sequelize');
const { Booking: getBookingModel } = require('../models/bookingModel');
const { PetProfile: getPetProfileModel } = require('../models/petProfileModel');
const { getPaymentModel } = require('../models/paymentModel');

const addBookingService = async (bookingData) => {
    const Booking = getBookingModel();
    const booking = await Booking.create(bookingData);
    return booking.id;
}

const getBookingService = async (
    page = 1,
    limit = 10,
    userId = '',
    status = '',
    hostId = ''
) => {
    const Booking = getBookingModel();
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) {
        where.userId = { [Op.iLike]: `%${userId}%` };
    }
    if (hostId) {
        where.hostId = { [Op.iLike]: `%${hostId}%` };
    }
    if (status) {
        where.status = { [Op.iLike]: `%${status}%` };
    }
    const { count, rows } = await Booking.findAndCountAll({
        where,
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
}

const getBookingByIdService = async (BookingId) => {
    const Booking = getBookingModel();
    const booking = await Booking.findByPk(BookingId);
    return booking;
}

const cancelUnpaidBookingsService = async (startOfToday) => {
    try {
        const Booking = getBookingModel();
        const Payment = getPaymentModel();

        const unpaidBookings = await Booking.findAll({
            where: {
                status: {
                    [Op.in]: ['initiated', 'running', 'scheduled']
                },
                checkIn: {
                    [Op.lt]: startOfToday
                },
                '$payments.id$': null
            },
            include: [
                {
                    model: Payment,
                    as: 'payments',
                    required: false,
                    attributes: ['id']
                }
            ],
            attributes: ['id']
        });

        if (!unpaidBookings.length) {
            return 0;
        }

        const unpaidBookingIds = unpaidBookings.map(b => b.id);

        const [cancelledCount] = await Booking.update(
            {
                status: 'cancelled',
                cancellationReason: 'payment not received from customer'
            },
            {
                where: {
                    id: { [Op.in]: unpaidBookingIds }
                }
            }
        );

        return cancelledCount;
    }
    catch (error) {
        console.error('Error in cancelUnpaidBookingsService:', error);
        throw error;
    }
};

const updateBookingStatusByTimeService = async () => {
    try {
        const Booking = getBookingModel();
        const now = new Date();
        console.log('Booking status cron run at: ' + now);
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        const unpaidCancelled = await cancelUnpaidBookingsService(startOfToday);

        const [runningUpdated] = await Booking.update(
            {
                status: 'running'
            },
            {
                where: {
                    checkIn: {
                        [Op.gte]: startOfToday,
                        [Op.lt]: startOfTomorrow,
                        [Op.lte]: now
                    },
                    status: {
                        [Op.notIn]: [
                            'cancelled',
                            'completed',
                            'running'
                        ]
                    }
                }
            }
        );

        const [completedUpdated] = await Booking.update(
            {
                status: 'completed'
            },
            {
                where: {
                    status: 'running',
                    checkOut: {
                        [Op.lte]: now
                    }
                }
            }
        );
        console.log('Booking status cron completed:', {
            unpaidCancelled,
            runningUpdated,
            completedUpdated,
            currentTime: now
        });
        return {
            unpaidCancelled,
            runningUpdated,
            completedUpdated
        };
    } catch (error) {
        console.error(
            'Error updating booking statuses:',
            error
        );
        throw error;
    }
};

const cancelBookingService = async (cancellationData) => {
    const Booking = getBookingModel();
    const booking = await Booking.findByPk(cancellationData.bookingId);
    if (!booking) {
        throw new Error('Booking not found');
    }
    if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
    }
    const updatedBooking = await Booking.update({
        status: 'cancelled',
        cancellationBy: cancellationData.cancellationBy,
        cancellationReason: cancellationData.cancellationReason,
        cancellationDate: cancellationData.cancellationDate
    }, {
        where: { id: cancellationData.bookingId }
    });
    return updatedBooking;
};

// ************ for admin use only ************
const getAllBookingService = async (
    page = 1,
    limit = 10,
    userId = '',
    status = '',
    id = '',
    customerName = '',
    hostName = ''
) => {
    const Booking = getBookingModel();
    const PetProfile = getPetProfileModel();
    const Payment = getPaymentModel();

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) {
        where.userId = { [Op.iLike]: `%${userId}%` };
    }
    if (status) {
        where.status = { [Op.iLike]: `%${status}%` };
    }
    if (id) {
        where.id = { [Op.iLike]: `%${id}%` };
    }
    const { count, rows } = await Booking.findAndCountAll({
        where,
        include: [
            {
                association: Booking.associations.customer,
                attributes: [
                    "name"
                ],
                required: !!customerName,
                where: customerName
                    ? {
                        name: {
                            [Op.iLike]: `%${customerName}%`
                        }
                    }
                    : undefined
            },
            {
                association: Booking.associations.host,
                attributes: [
                    "propertyName"
                ],
                required: !!hostName,
                where: hostName
                    ? {
                        propertyName: {
                            [Op.iLike]: `%${hostName}%`
                        }
                    }
                    : undefined
            }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        attributes: [
            "id",
            "checkIn",
            "checkOut",
            "status",
            "petIds",
            "hostId",
            "cancellationReason",
            "createdAt"
        ],
        offset,
        distinct: true
    });

    const data = await Promise.all(
        rows.map(async (booking) => {
            const bookingData = booking.toJSON();
            let pets = [];
            if (Array.isArray(bookingData.petIds) && bookingData.petIds.length) {
                pets = await PetProfile.findAll({
                    where: { id: { [Op.in]: bookingData.petIds } },
                    attributes: ['id', 'petName', 'name']
                });
            }
            const amount = await Payment.findOne({
                where: { bookingId: bookingData.id },
                attributes: ['amount']
            });

            return {
                ...bookingData,
                pets: pets.map(p => ({ name: p.petName || p.name })),
                petIds: undefined,
                amount: amount?.amount || null
            };
        })
    );

    return {
        data: data,
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit)
    };
}

const getAllBookingOfHost = async (
    page = 1,
    limit = 10,
    hostId = '',
    status = '',
    id = '',
    customerName = '',
    createdAtFrom = '',
    createdAtTo = '',
    checkInFrom = '',
    checkInTo = '',
    checkOutFrom = '',
    checkOutTo = ''
) => {
    const Booking = getBookingModel();
    const PetProfile = getPetProfileModel();
    const Payment = getPaymentModel();

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (hostId) {
        where.hostId = { [Op.iLike]: `%${hostId}%` };
    }

    if (status) {
        where.status = { [Op.iLike]: `%${status}%` };
    }

    if (id) {
        where.id = { [Op.iLike]: `%${id}%` };
    }

    if (createdAtFrom || createdAtTo) {
        where.createdAt = {};
        if (createdAtFrom) {
            where.createdAt[Op.gte] = new Date(createdAtFrom);
        }
        if (createdAtTo) {
            const endDate = new Date(createdAtTo);
            endDate.setHours(23, 59, 59, 999);
            where.createdAt[Op.lte] = endDate;
        }
    }

    if (checkInFrom || checkInTo) {
        where.checkIn = {};
        if (checkInFrom) {
            where.checkIn[Op.gte] = new Date(checkInFrom);
        }
        if (checkInTo) {
            const endDate = new Date(checkInTo);
            endDate.setHours(23, 59, 59, 999);
            where.checkIn[Op.lte] = endDate;
        }
    }

    if (checkOutFrom || checkOutTo) {
        where.checkOut = {};
        if (checkOutFrom) {
            where.checkOut[Op.gte] = new Date(checkOutFrom);
        }
        if (checkOutTo) {
            const endDate = new Date(checkOutTo);
            endDate.setHours(23, 59, 59, 999);
            where.checkOut[Op.lte] = endDate;
        }
    }

    const { count, rows } = await Booking.findAndCountAll({
        where,
        include: [
            {
                association: Booking.associations.customer,
                attributes: ['name'],
                required: !!customerName,
                where: customerName
                    ? {
                        name: {
                            [Op.iLike]: `%${customerName}%`
                        }
                    }
                    : undefined
            },
            {
                association: Booking.associations.host,
                attributes: ['propertyName']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        attributes: [
            'id',
            'checkIn',
            'checkOut',
            'status',
            'petIds',
            'cancellationReason',
            'createdAt'
        ],
        offset,
        distinct: true
    });
    const data = await Promise.all(
        rows.map(async (booking) => {
            const bookingData = booking.toJSON();
            let pets = [];
            if (
                Array.isArray(bookingData.petIds) &&
                bookingData.petIds.length
            ) {
                pets = await PetProfile.findAll({
                    where: { id: { [Op.in]: bookingData.petIds } },
                    attributes: ['id', 'petName', 'name']
                });
            }

            const amount = await Payment.findOne({
                where: { bookingId: bookingData.id },
                attributes: ['amount']
            });

            return {
                ...bookingData,
                pets: pets.map((p) => ({ name: p.petName || p.name })),
                petIds: undefined,
                amount: amount?.amount || null
            };
        })
    );
    return {
        data,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
    };
};

module.exports = {
    addBookingService,
    getBookingService,
    getBookingByIdService,
    updateBookingStatusByTimeService,
    cancelBookingService,
    getAllBookingService,
    getAllBookingOfHost
}