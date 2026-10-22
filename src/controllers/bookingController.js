const { success } = require("zod");
const { getBookingService, getBookingByIdService, addBookingService, updateBookingStatusByTimeService, cancelBookingService, getAllBookingService, getAllBookingOfHost } = require("../services/bookingService");
const { getHostByIdService } = require("../services/hostService");
const { getPetProfileByIdService } = require("../services/petProfileService");
const { getUserById } = require("../services/userService");
const { getHostHolidaysByHostIdService } = require("../services/HostHoliday");
const {
    sendBookingCancellationEmailToCustomer,
    sendBookingCancellationEmailToHost
} = require("../services/email/emailService");


const getBookingController = async (req, res) => {
    try {
        const { page, limit, status, hostId } = req.query;
        const userId = req.user.id;
        const bookings = await getBookingService(page, limit, userId, status, hostId);
        res.json(bookings);
    } catch (error) {
        console.error('Error in booking controller:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const getBookingByIdController = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await getBookingByIdService(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'booking not found' });
        }
        res.json(booking);
    } catch (error) {
        console.error('Error in getBookingById Controller:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const postBookingController = async (req, res) => {
    const userId = req.user.id;
    try {
        req.body.userId = userId;
        // const hostResponse = await getHostByUserIDService(userId);
        // if (hostResponse && hostResponse.id) {
        //     return res.status(400).json({
        //         success: false,
        //         message: `You are a host and cannot make bookings.`
        //     });
        // }

        // Host holiday check 
        const hostHolidays = await getHostHolidaysByHostIdService(req.body.hostId);
        const checkIn = new Date(req.body.checkIn);
        const checkOut = new Date(req.body.checkOut);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Valid check-in and check-out dates are required."
            });
        }

        if (checkIn >= checkOut) {
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date."
            });
        }

        const holidayOverlap = hostHolidays?.find((holiday) => {
            const holidayFrom = new Date(holiday.fromDate);
            const holidayTo = new Date(holiday.toDate);

            return (
                checkIn <= holidayTo &&
                checkOut >= holidayFrom
            );
        });

        if (holidayOverlap) {
            return res.status(400).json({
                success: false,
                message: "Host is on holiday and is not accepting bookings for the selected dates.",
                holiday: {
                    fromDate: holidayOverlap.fromDate,
                    toDate: holidayOverlap.toDate,
                    reason: holidayOverlap.reason
                }
            });
        }

        // check for host accepts those pet or not 
        const { petIds, hostId } = req.body;
        if (!hostId) {
            return res.status(400).json({
                success: false,
                message: "hostId is required."
            });
        }

        const host = await getHostByIdService(hostId);
        if (!host) {
            return res.status(400).json({
                success: false,
                message: "Host not found."
            });
        }

        if (host.status === "suspended") {
            return res.status(400).json({
                success: false,
                message:
                    "This host is suspended and cannot accept bookings."
            });
        }

        if (!Array.isArray(petIds) || petIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one pet is required."
            });
        }

        const uniquePetIds = [...new Set(petIds)];
        if (uniquePetIds.length !== petIds.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate pet IDs are not allowed."
            });
        }

        const hostBoardingPets = host.boardingOfPets || [];
        const petnames = [];
        for (const petId of uniquePetIds) {
            const petProfile = await getPetProfileByIdService(petId);
            petnames.push(petProfile.petName);
            if (!petProfile) {
                return res.status(400).json({
                    success: false,
                    message: `Pet profile not found: ${petId}`
                });
            }

            if (petProfile.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: `Pet ${petId} does not belong to this customer.`
                });
            }

            if (!hostBoardingPets.includes(petProfile.petType)) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Host does not accept ${petProfile.petType} pets.`
                });
            }
        }

        req.body.petIds = uniquePetIds;
        const bookingId = await addBookingService(req.body);

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            bookingId
        });
    } catch (error) {
        console.error(
            "Error in postBooking controller:",
            error
        );
        return res.status(500).json({
            error: "Internal Server Error",
            success: false,
            message: error.message
        });
    }
};

const updateBookingStatusController = async (req, res) => {
    try {
        const response = await updateBookingStatusByTimeService();
        res.json(response);
    } catch (error) {
        console.error('Error in updateBookingStatus controller:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

const cancelBookingController = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;
        const UserResponse = await getUserById(userId);
        const booking = await getBookingByIdService(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        if (["running", "completed"].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel a running or completed booking."
            });
        }

        if (!req.body.cancellationReason) {
            return res.status(400).json({
                success: false,
                message: "Cancellation reason is required. {cancellationReason}"
            });
        }

        if (req.body.cancellationReason && typeof req.body.cancellationReason !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Cancellation reason must be a string."
            });
        }

        const CancellationData = {
            bookingId: bookingId,
            cancellationBy: UserResponse.role,
            cancellationReason: req.body.cancellationReason || "No reason provided",
            cancellationDate: new Date()
        }

        const updatedBooking = await cancelBookingService(CancellationData);
        let cancellationEmailsSent = false;

        try {
            const customer = await getUserById(booking.userId);
            const host = await getHostByIdService(booking.hostId);
            const hostUser = host ? await getUserById(host.userId) : null;
            const pets = await Promise.all(
                (booking.petIds || []).map((petId) => getPetProfileByIdService(petId))
            );
            const emailBooking = {
                bookingId: booking.id,
                petnames: pets.filter(Boolean).map((pet) => pet.petName).join(", "),
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                cancellationBy: CancellationData.cancellationBy,
                cancellationReason: CancellationData.cancellationReason
            };

            if (!customer || !hostUser) {
                throw new Error("Could not find the customer or host for cancellation notifications.");
            }

            const emailResults = await Promise.allSettled([
                sendBookingCancellationEmailToCustomer({
                    ...emailBooking,
                    email: customer.email,
                    name: customer.name
                }),
                sendBookingCancellationEmailToHost({
                    ...emailBooking,
                    email: hostUser.email,
                    name: hostUser.name,
                    guestName: customer.name
                })
            ]);
            cancellationEmailsSent = emailResults.every((result) => result.status === "fulfilled");
            emailResults.forEach((result) => {
                if (result.status === "rejected") {
                    console.error("Booking cancellation email failed:", result.reason);
                }
            });
        } catch (error) {
            console.error("Could not send booking cancellation emails:", error.message);
        }

        return res.status(200).json({
            success: true,
            message: "Booking canceled successfully",
            cancellationEmailsSent,
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Error in cancelBooking controller:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

// *****************  for admin use only *****************
const getAllBookingsController = async (req, res) => {
    try {
        const { page,
            limit,
            status,
            id,
            customerName,
            hostName } = req.query;
        const bookings = await getAllBookingService(
            page,
            limit,
            null,
            status,
            id,
            customerName,
            hostName);
        res.json(bookings);
    } catch (error) {
        console.error('Error in getAllBookings controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

const getAllBookingsOfHostController = async (req, res) => {
    try {
        const hostId = req.params.hostId;
        if (!hostId) {
            return res.status(400).json({
                success: false,
                message: "hostId is required"
            })
        }
        const { page,
            limit,
            status,
            id,
            customerName,
            createdAtFrom,
            createdAtTo,
            checkInFrom,
            checkInTo,
            checkOutFrom,
            checkOutTo } = req.query;
        const bookings = await getAllBookingOfHost(
            page,
            limit,
            hostId,
            status,
            id,
            customerName,
            createdAtFrom,
            createdAtTo,
            checkInFrom,
            checkInTo,
            checkOutFrom,
            checkOutTo);
        res.json(bookings);
    } catch (error) {
        console.error('Error in getAllBookings of a host controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

module.exports = {
    getBookingController,
    getBookingByIdController,
    postBookingController,
    updateBookingStatusController,
    cancelBookingController,
    getAllBookingsController,
    getAllBookingsOfHostController
}