const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db")
const { User: getUser } = require('./User');
const { PetTypes, amenities, hostStatus, bussinessType, property, propertyAreaType, Services } = require("../config/pets");

let Host = null;

const initializeHost = () => {
    const sequelize = getSequelize();
    const User = getUser();

    Host = sequelize.define('Host', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            unique: true,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        status: {
            type: DataTypes.ENUM(...hostStatus),
            defaultValue: 'unverified',
            allowNull: false
        },
        accountSuspendReason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        topRated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        mostPopullar: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        physicalverification: {
            type: DataTypes.BOOLEAN,
            default: false
        },
        propertyName: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false
        },
        address: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidAddress(value) {
                    if (!value || typeof value !== "object" || Array.isArray(value)) {
                        throw new Error("Address must be an object.");
                    }

                    const requiredFields = [
                        "street",
                        "area",
                        "city",
                        "state",
                        "pincode"
                    ];

                    for (const field of requiredFields) {
                        if (
                            value[field] === undefined ||
                            value[field] === null ||
                            value[field] === ""
                        ) {
                            throw new Error(`${field} is required in address.`);
                        }
                    }
                }
            }
        },
        bussinessType: {
            type: DataTypes.ENUM(...bussinessType),
            allowNull: false
        },
        propertyType: {
            type: DataTypes.ENUM(...property),
            allowNull: false
        },
        aboutBusiness: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        boardingOfPets: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidBoardingOfPets(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("boardingOfPets must be an array.");
                    }

                    value.forEach(item => {
                        if (!PetTypes.includes(item)) {
                            throw new Error(`Invalid pet type: ${item} in boardingOfPets`);
                        }
                    });
                }
            }
        },
        capacity: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidCapacity(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("Capacity must be an array.");
                    }
                    value.forEach(item => {
                        if (!PetTypes.includes(item.petType)) {
                            throw new Error(`Invalid petType: ${item.petType} in capacity`);
                        }

                        if (typeof item.capacity !== "number") {
                            throw new Error("capacity must be a number");
                        }
                    });
                }
            }
        },
        numberOfRooms: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidNumberOfRooms(value) {
                    if (!value || typeof value !== "object" || Array.isArray(value)) {
                        throw new Error("numberOfRooms must be an object.");
                    }

                    for (const [petType, data] of Object.entries(value)) {
                        if (!PetTypes.includes(petType)) {
                            throw new Error(`Invalid pet type: ${petType} in numberOfRooms.`);
                        }

                        if (!data || typeof data !== "object") {
                            throw new Error(`Value for ${petType} must be an object in numberOfRooms.`);
                        }

                        if (
                            typeof data.room !== "number" ||
                            !Number.isInteger(data.room) ||
                            data.room < 0
                        ) {
                            throw new Error(`${petType}.room must be a non-negative integer in numberOfRooms.`);
                        }

                        if (
                            typeof data.cage !== "number" ||
                            !Number.isInteger(data.cage) ||
                            data.cage < 0
                        ) {
                            throw new Error(`${petType}.cage must be a non-negative integer in numberOfRooms.`);
                        }
                    }
                }
            }
        },
        sizeOfRooms: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidSizeOfRooms(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("sizeOfRooms must be an array.");
                    }
                    value.forEach(item => {
                        if (!PetTypes.includes(item.petType)) {
                            throw new Error(`Invalid petType: ${item.petType} in sizeOfRooms.`);
                        }

                        if (typeof item.area !== "number") {
                            throw new Error("area must be a number in sizeOfRooms.");
                        }
                    });
                }
            }
        },
        sizeOfCages: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isValidSizeOfCages(value) {
                    if (value === null || value === undefined) {
                        return;
                    }
                    if (!Array.isArray(value)) {
                        throw new Error("sizeOfCages must be an array.");
                    }

                    value.forEach(item => {
                        if (!PetTypes.includes(item.petType)) {
                            throw new Error(
                                `Invalid petType: ${item.petType} in sizeOfCages.`
                            );
                        }
                        ["length", "breadth", "height"].forEach(dimension => {
                            if (
                                typeof item[dimension] !== "number" ||
                                item[dimension] < 0
                            ) {
                                throw new Error(
                                    `${dimension} must be a non-negative number for petType: ${item.petType} in sizeOfCages.`
                                );
                            }
                        });
                    });
                }
            }
        },
        pricePerPet: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidPricePerPet(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("pricePerPet must be an array.");
                    }
                    value.forEach(item => {
                        if (!PetTypes.includes(item.petType)) {
                            throw new Error(`Invalid petType: ${item.petType} in pricePerPet.`);
                        }

                        if (item.petType === "Dog") {
                            ["small", "medium", "large"].forEach(size => {
                                if (
                                    !item[size] ||
                                    typeof item[size] !== "object" ||
                                    typeof item[size].price !== "number" ||
                                    item[size].price < 0
                                ) {
                                    throw new Error(
                                        `Dog must have ${size}.price as a positive number in pricePerPet.`
                                    );
                                }
                            });
                        } else {
                            if (
                                typeof item.price !== "number" ||
                                item.price < 0
                            ) {
                                throw new Error(
                                    `${item.petType} must have a positive price in pricePerPet.`
                                );
                            }
                        }
                    });
                }
            }
        },
        Services: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidServices(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("Services must be an array.");
                    }

                    value.forEach(item => {
                        if (!Services.includes(item)) {
                            throw new Error(`Invalid service: ${item} in Services.`);
                        }
                    });
                }
            }
        },
        nameOfBusiness: {
            type: DataTypes.STRING,
            allowNull: false
        },
        limitationsForGuests: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        propertyAreaSize: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        numberOfCareTakers: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        experienceWithPets: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        rule: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        amenities: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isValidAmenities(value) {
                    if (value == null) return;
                    if (!Array.isArray(value)) {
                        throw new Error("amenities must be an array.");
                    }

                    value.forEach(item => {
                        if (!amenities.includes(item)) {
                            throw new Error(`Invalid amenity: ${item} in amenities.`);
                        }
                    });
                }
            }
        },
        paidAmenities: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isValidCapacity(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("Capacity must be an array.");
                    }
                    value.forEach(item => {
                        if (!amenities.includes(item.amenitie)) {
                            throw new Error(`Invalid amenity: ${item.amenitie} in paidAmenities.`);
                        }

                        if (typeof item.price !== "number") {
                            throw new Error("price must be a number in paidAmenities.");
                        }

                        if (typeof item.info !== "string") {
                            throw new Error("info must be a string in paidAmenities.");
                        }
                    });
                }
            }
        },
        propertyPhotos: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isValidUrls(value) {
                    if (value == null) return;

                    if (!Array.isArray(value)) {
                        throw new Error("propertyPhotos must be an array.");
                    }

                    value.forEach((url) => {
                        if (typeof url !== "string") {
                            throw new Error("Each property photo must be a string.");
                        }

                        const urlRegex =
                            /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

                        if (!urlRegex.test(url)) {
                            throw new Error(`Invalid URL: ${url} in propertyPhotos.`);
                        }
                    });
                }
            }
        },
        idProof: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidUrls(value) {
                    if (value == null) return;

                    if (!Array.isArray(value)) {
                        throw new Error("idProof must be an array.");
                    }

                    value.forEach((url) => {
                        if (typeof url !== "string") {
                            throw new Error("Each idProof photo must be a string.");
                        }

                        const urlRegex =
                            /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

                        if (!urlRegex.test(url)) {
                            throw new Error(`Invalid URL: ${url} in idProof.`);
                        }
                    });
                }
            }
        },
        addressProof: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isValidUrls(value) {
                    if (value == null) return;

                    if (!Array.isArray(value)) {
                        throw new Error("addressProof must be an array.");
                    }

                    value.forEach((url) => {
                        if (typeof url !== "string") {
                            throw new Error("Each addressProof photo must be a string.");
                        }

                        const urlRegex =
                            /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

                        if (!urlRegex.test(url)) {
                            throw new Error(`Invalid URL: ${url} in addressProof.`);
                        }
                    });
                }
            }
        },
        noc: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isValidUrls(value) {
                    if (value == null) return;

                    if (!Array.isArray(value)) {
                        throw new Error("noc must be an array.");
                    }

                    value.forEach((url) => {
                        if (typeof url !== "string") {
                            throw new Error("Each noc photo must be a string.");
                        }

                        const urlRegex =
                            /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

                        if (!urlRegex.test(url)) {
                            throw new Error(`Invalid URL: ${url} in noc.`);
                        }
                    });
                }
            }
        },
        businessProof: {
            type: DataTypes.JSON,
            allowNull: true,
            validate: {
                isValidUrls(value) {
                    if (value == null) return;

                    if (!Array.isArray(value)) {
                        throw new Error("businessProof must be an array.");
                    }

                    value.forEach((url) => {
                        if (typeof url !== "string") {
                            throw new Error("Each businessProof photo must be a string.");
                        }

                        const urlRegex =
                            /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

                        if (!urlRegex.test(url)) {
                            throw new Error(`Invalid URL: ${url} in businessProof.`);
                        }
                    });
                }
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
    Host.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasOne(Host, { foreignKey: 'userId', as: 'host' });
    return Host;
};

const getHost = () => {
    if (!Host) {
        return initializeHost();
    }
    return Host;
};

module.exports = { Host: getHost, initializeHost };