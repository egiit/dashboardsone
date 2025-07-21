import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const StorageInventoryModel = db.define(
    "storage_inventory",
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        UNIT_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        BUILDING_ID: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        BUILDING_ROOM_ID: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        RAK_NUMBER: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        LEVEL: {
            type: DataTypes.STRING(25),
            allowNull: true,
        },
        POSITION: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        DESCRIPTION: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        CATEGORY: {
            type: DataTypes.ENUM('ROOM', 'LINE'),
            allowNull: true,
            defaultValue: 'ROOM'
        },
        SERIAL_NUMBER: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        IS_DELETE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: "storage_inventory",
        timestamps: false,
    }
);

export default StorageInventoryModel;