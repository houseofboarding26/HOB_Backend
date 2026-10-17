const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");
const { Host: getHost } = require('./HostModel');


let HostHolidayModel = null;

const initializeHostHolidayModel = () => {
    const sequelize = getSequelize();
    const Host = getHost();

    HostHolidayModel = sequelize.define('HostHoliday', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        hostId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Hosts',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        hostName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fromDate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isTodayOrFuture(value) {
                    const fromDate = new Date(value);
                    const now = new Date();

                    if (fromDate < now) {
                        throw new Error(
                            "Start date cannot be in the past."
                        );
                    }
                }
            }
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        toDate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isTodayOrFuture(value) {
                    const toDate = new Date(value);
                    const now = new Date();

                    if (toDate < now) {
                        throw new Error(
                            "End date cannot be in the past."
                        );
                    }
                }
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
        {
            tableName: "HostHolidays",
            validate: {
                validDateRange() {
                    if (
                        this.fromDate &&
                        this.toDate &&
                        new Date(this.toDate) <= new Date(this.fromDate)
                    ) {
                        throw new Error(
                            "End date must be after start date."
                        );
                    }
                }
            }
        });
    HostHolidayModel.belongsTo(Host, { foreignKey: "hostId", as: "hostHoliday", });
    Host.hasMany(HostHolidayModel, { foreignKey: "hostId", as: "HostHolidays", });
    return HostHolidayModel;
}

const getHostHolidayModel = () => {
    if (!HostHolidayModel) {
        return initializeHostHolidayModel();
    }
    return HostHolidayModel;
};

module.exports = { HostHoliday: getHostHolidayModel, initializeHostHolidayModel };