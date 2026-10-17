
const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");
const { Customer: getCustomer } = require("./CustomerModel");
const { Host: getHost } = require("./HostModel");
const { bookingType, amenities, bookingStatus, Role } = require("../config/pets");

let Booking = null;

const initializeBooking = () => {
    const sequelize = getSequelize();
    const CustomerModel = getCustomer();
    const HostModel = getHost();

    Booking = sequelize.define(
        "Bookings",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },

            userId: {
                type: DataTypes.UUID,
                allowNull: false,

                references: {
                    model: CustomerModel,
                    key: "userId",
                },

                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },

            hostId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: HostModel,
                    key: "id"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            petIds: {
                type: DataTypes.JSON,
                allowNull: false,

                validate: {
                    isValidPetIds(value) {
                        if (!Array.isArray(value) || value.length === 0) {
                            throw new Error(
                                "At least one pet is required."
                            );
                        }

                        value.forEach((id) => {
                            if (
                                typeof id !== "string" ||
                                !id.trim()
                            ) {
                                throw new Error(
                                    "Each pet ID must be a valid string."
                                );
                            }
                        });
                    },
                },
            },

            status: {
                type: DataTypes.ENUM(...bookingStatus),
                defaultValue: "initiated",
            },

            checkIn: {
                type: DataTypes.DATE,
                allowNull: false,

                validate: {
                    isTodayOrFuture(value) {
                        const inputDate = new Date(value);
                        const today = new Date();

                        inputDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        if (inputDate < today) {
                            throw new Error(
                                "Check-in date cannot be in the past."
                            );
                        }
                    },
                },
            },

            checkOut: {
                type: DataTypes.DATE,
                allowNull: false,

                validate: {
                    isTodayOrFuture(value) {
                        const inputDate = new Date(value);
                        const today = new Date();

                        inputDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        if (inputDate < today) {
                            throw new Error(
                                "Check-out date cannot be in the past."
                            );
                        }
                    },
                },
            },

            bookingType: {
                type: DataTypes.ENUM(...bookingType),
                allowNull: false,
            },

            cancellationProtection: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

            cancellationReason: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            cancellationDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            cancellationBy: {
                type: DataTypes.ENUM(...Role),
                allowNull: true,
            },

            emergencyBoardingPrice: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },

            instructions: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            amenities: {
                type: DataTypes.JSON,
                allowNull: true,

                validate: {
                    isValidAmenities(value) {
                        if (value == null) return;

                        if (!Array.isArray(value)) {
                            throw new Error(
                                "Amenities must be an array."
                            );
                        }

                        value.forEach((item) => {
                            if (
                                !item ||
                                typeof item !== "object" ||
                                !item.amenity
                            ) {
                                throw new Error(
                                    "Each amenity must contain amenity and price."
                                );
                            }

                            if (!amenities.includes(item.amenity)) {
                                throw new Error(
                                    `Invalid amenity: ${item.amenity}`
                                );
                            }

                            if (
                                typeof item.price !== "number" ||
                                item.price < 0
                            ) {
                                throw new Error(
                                    `Price for ${item.amenity} must be a non-negative number.`
                                );
                            }
                        });
                    },
                },
            },

            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },

        {
            validate: {
                checkDates() {
                    if (this.checkOut <= this.checkIn) {
                        throw new Error(
                            "Check-out date must be after check-in date."
                        );
                    }
                },
            },
        }
    );

    /*
     * Associations
     *
     * NOTE:
     * petIds is JSON, so there is intentionally NO
     * PetProfile association here.
     */

    Booking.belongsTo(CustomerModel, {
        foreignKey: "userId",
        targetKey: "userId",
        as: "customer",
    });

    Booking.belongsTo(HostModel, {
        foreignKey: "hostId",
        targetKey: "id",
        as: "host"
    });

    CustomerModel.hasMany(Booking, {
        foreignKey: "userId",
        sourceKey: "userId",
        as: "bookings",
    });

    HostModel.hasMany(Booking, {
        foreignKey: "hostId",
        sourceKey: "id",
        as: "bookings"
    });

    const PaymentModel = sequelize.models?.Payment;
    if (PaymentModel) {
        if (!Booking.associations?.payments) {
            Booking.hasMany(PaymentModel, {
                foreignKey: 'bookingId',
                sourceKey: 'id',
                as: 'payments'
            });
        }

        if (!PaymentModel.associations?.booking) {
            PaymentModel.belongsTo(Booking, {
                foreignKey: 'bookingId',
                targetKey: 'id',
                as: 'booking'
            });
        }
    }

    return Booking;
};

const getBookingModel = () => {
    if (!Booking) {
        return initializeBooking();
    }

    return Booking;
};

module.exports = {
    Booking: getBookingModel,
    initializeBooking,
};

