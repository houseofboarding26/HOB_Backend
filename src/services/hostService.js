
const { Op, Sequelize } = require('sequelize');
const { Host: getHost } = require('../models/HostModel');

const escapeSqlString = (value) => String(value).replace(/'/g, "''");

const jsonTextContains = (field, value) =>
    Sequelize.literal(`
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(COALESCE(${field}::jsonb, '[]'::jsonb)) AS item
            WHERE item = '${escapeSqlString(value)}'
        )
    `);

const jsonObjectContainsKeyValue = (field, key, value) =>
    Sequelize.literal(`
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements(COALESCE(${field}::jsonb, '[]'::jsonb)) AS item
            WHERE item->>'${key}' = '${escapeSqlString(value)}'
        )
    `);

const addHostService = async (hostData) => {
    const Host = getHost();
    const host = await Host.create(hostData);
    return host.id;
}

const updateHostService = async (req, res) => {
    const Host = getHost();
    const { id } = req.params
    const {
        status,
        accountSuspendReason,
        topRated,
        physicalverification,
        mostPopullar
    } = req.body;

    const updateData = {};

    if (status !== undefined) {
        updateData.status = status;
    }

    if (accountSuspendReason !== undefined) {
        updateData.accountSuspendReason = accountSuspendReason;
    }

    if (topRated !== undefined) {
        updateData.topRated = topRated;
    }

    if (mostPopullar !== undefined) {
        updateData.mostPopullar = mostPopullar;
    }

    if (physicalverification !== undefined) {
        updateData.physicalverification = physicalverification;
    }
    const [updatedRows] = await Host.update(updateData, {
        where: { id }
    });

    return updatedRows;
};

const updateHostPropertyService = async (req, res) => {
    const Host = getHost();
    const { id } = req.params
    const {
        boardingOfPets,
        capacity,
        numberOfRooms,
        sizeOfRooms,
        sizeOfCages,
        pricePerPet,
        Services,
        amenities,
        paidAmenities,
        propertyPhotos
    } = req.body;

    const updateData = {};

    if (boardingOfPets !== undefined) {
        updateData.boardingOfPets = boardingOfPets;
    }

    if (capacity !== undefined) {
        updateData.capacity = capacity;
    }

    if (numberOfRooms !== undefined) {
        updateData.numberOfRooms = numberOfRooms;
    }

    if (sizeOfRooms !== undefined) {
        updateData.sizeOfRooms = sizeOfRooms;
    }

    if (sizeOfCages !== undefined) {
        updateData.sizeOfCages = sizeOfCages;
    }

    if (pricePerPet !== undefined) {
        updateData.pricePerPet = pricePerPet;
    }

    if (amenities !== undefined) {
        updateData.amenities = amenities;
    }

    if (paidAmenities !== undefined) {
        updateData.paidAmenities = paidAmenities;
    }

    if (Services !== undefined) {
        updateData.Services = Services;
    }

    if (propertyPhotos !== undefined) {
        updateData.propertyPhotos = propertyPhotos;
    }

    const [updatedRows] = await Host.update(updateData, {
        where: { id }
    });

    return updatedRows;
};

const getHostsService = async (
    page = 1,
    limit = 10,
    propertyName = '',
    email = '',
    address = '',
    nameOfBusiness = '',
    boardingOfPets = '',
    amenities = [],
    status = '',
    bussinessType = '',
    minPrice = '',
    maxPrice = ''
) => {
    const Host = getHost();
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (propertyName) {
        where.propertyName = { [Op.iLike]: `%${propertyName}%` };
    }

    if (status) {
        where.status = status;
    } else {
        where.status = "verified";
    }

    if (address) {
        const searchAddress = escapeSqlString(String(address).trim());
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(
            Sequelize.literal(`LOWER(CAST(address AS text)) LIKE LOWER('%${searchAddress}%')`)
        );
    }

    if (bussinessType) {
        if (typeof bussinessType === "string") {
            try {
                bussinessType = JSON.parse(bussinessType);
            } catch {
                bussinessType = bussinessType.split(",");
            }
        }

        if (Array.isArray(bussinessType) && bussinessType.length) {
            where.bussinessType = {
                [Op.in]: bussinessType
            };
        }
    }

    if (minPrice !== '' || maxPrice !== '') {
        const min = Number(minPrice);
        const max = Number(maxPrice);

        if (Number.isNaN(min) || Number.isNaN(max)) {
            throw new Error('minPrice and maxPrice must be valid numbers');
        }

        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(
            Sequelize.literal(`
                EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(COALESCE(pricePerPet::jsonb, '[]'::jsonb)) AS price_data
                    WHERE (
                        price_data->>'petType' = 'Dog'
                        AND COALESCE((price_data->'small'->>'price')::numeric, 0) BETWEEN ${min} AND ${max}
                    )
                    OR (
                        price_data->>'petType' <> 'Dog'
                        AND COALESCE((price_data->>'price')::numeric, 0) BETWEEN ${min} AND ${max}
                    )
                )
            `)
        );
    }

    if (nameOfBusiness) {
        where.nameOfBusiness = { [Op.iLike]: `%${nameOfBusiness}%` };
    }

    if (boardingOfPets) {
        if (typeof boardingOfPets === "string") {
            try {
                boardingOfPets = JSON.parse(boardingOfPets);
            } catch {
                boardingOfPets = boardingOfPets.split(",");
            }
        }

        where[Op.and] = where[Op.and] || [];
        const petConditions = boardingOfPets.map((pet) =>
            jsonTextContains('boardingOfPets', pet.trim())
        );

        where[Op.and].push({ [Op.or]: petConditions });
    }

    if (typeof amenities === "string") {
        amenities = JSON.parse(amenities);
    }

    if (amenities?.length) {
        where[Op.or] = [];

        for (const amenity of amenities) {
            where[Op.or].push(jsonTextContains('amenities', amenity));
            where[Op.or].push(jsonObjectContainsKeyValue('paidAmenities', 'amenitie', amenity));
        }
    }

    const { count, rows } = await Host.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        attributes: [
            "id",
            "propertyName",
            "status",
            "bussinessType",
            "address",
            "boardingOfPets",
            "nameOfBusiness",
            "boardingOfPets",
            "propertyPhotos",
            "Services",
            "pricePerPet",
            "topRated",
            "mostPopullar",
            "physicalverification"
        ]
    });

    return {
        data: rows,
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit)
    };
}

const getHostForAdminsService = async (
    page = 1,
    limit = 10,
    name = '',
    email = '',
    address = '',
    nameOfBusiness = '',
    boardingOfPets = '',
    amenities = [],
    status = ''
) => {
    const Host = getHost();
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (name) {
        where.name = { [Op.iLike]: `%${name}%` };
    }

    if (status) {
        where.status = status;
    }

    if (address) {
        const searchAddress = escapeSqlString(String(address).trim());
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(
            Sequelize.literal(`LOWER(CAST(address AS text)) LIKE LOWER('%${searchAddress}%')`)
        );
    }

    if (nameOfBusiness) {
        where.nameOfBusiness = { [Op.iLike]: `%${nameOfBusiness}%` };
    }

    if (boardingOfPets) {
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(
            jsonTextContains('boardingOfPets', boardingOfPets)
        );
    }

    if (typeof amenities === "string") {
        amenities = JSON.parse(amenities);
    }

    if (amenities?.length) {
        where[Op.or] = [];

        for (const amenity of amenities) {
            where[Op.or].push(jsonTextContains('amenities', amenity));
            where[Op.or].push(jsonObjectContainsKeyValue('paidAmenities', 'amenitie', amenity));
        }
    }

    const { count, rows } = await Host.findAndCountAll({
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
    };
}

const getHostByIdService = async (hostId) => {
    const Host = getHost();
    const host = await Host.findByPk(hostId);
    return host;
}

const getHostByUserIDService = async (userId) => {
    const Host = getHost();
    const host = await Host.findOne({
        where: {
            userId: userId
        }
    });
    return host?.dataValues;
};

module.exports = { addHostService, getHostsService, getHostByIdService, getHostByUserIDService, getHostForAdminsService, updateHostService, updateHostPropertyService };