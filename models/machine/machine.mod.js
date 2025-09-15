import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const MecDownTimeModel = db.define(
    "mec_down_time",
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        START_TIME: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        RESPONSE_TIME: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        END_TIME: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        DESCRIPTION: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        MACHINE_ID: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        STORAGE_INVENTORY_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        MECHANIC_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        STATUS: {
            type: DataTypes.ENUM('DONE', 'BROKEN', 'ON_FIX', 'REPLACE'),
            defaultValue: 'BROKEN'
        },
        IS_COMPLETE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        CREATED_AT: {
            type: DataTypes.DATE
        },
        UPDATED_AT: {
            type: DataTypes.DATE
        },
        ID_SITELINE: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        SCHD_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        UPDATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "mec_down_time",
        timestamps: false,
    }
);

export const MecListMachine = db.define(
    "mec_item_master",
    {
        MACHINE_ID: {
            type: DataTypes.STRING(255),
            allowNull: false,
            primaryKey: true,
        },
        MACHINE_TYPE: {
            type: DataTypes.BIGINT(20),
            allowNull: true,
        },
        MACHINE_DESCRIPTION: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_SERIAL: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_UOM: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_SECTION: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_BRAND: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_MODEL: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_CATEGORY: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_KODE_DOC: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_NO_BC: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_DOK_DATE: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        MACHINE_STATUS: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MACHINE_ADD_ID: {
            type: DataTypes.BIGINT(20),
            allowNull: true,
        },
        MACHINE_MOD_ID: {
            type: DataTypes.BIGINT(20),
            allowNull: true,
        },
        STORAGE_INVENTORY_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        DEPARTMENT_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        SEQ_NO: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        STATUS: {
            type: DataTypes.ENUM('NORMAL', 'BROKEN', 'ON_FIX'),
            defaultValue: 'NORMAL'
        },
        IS_REPLACE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        freezeTableName: true,
    }
);

