import {
    DataTypes
} from "sequelize";
import db from "../../config/database.js";


export const ScanSewing = db.define(
    "order_scan_log", {
        BARCODE_SERIAL: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        SEWING_SCANTIME: {
            type: DataTypes.NOW,
            allowNull: true
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false,
    }
);

export const SewingSiteLine = db.define(
    "item_siteline", {
        ID_SITELINE: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        SITE: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        LINE: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        SHIFT: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        START_TIME: {
            type: DataTypes.TIME,
            allowNull: true
        },
        END_TIME: {
            type: DataTypes.TIME,
            allowNull: true
        },
        CREATE_DATE: {
            type: DataTypes.DATE,
            allowNull: true
        },
        CREATE_BY: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        UPDATE_DATE: {
            type: DataTypes.DATE,
            allowNull: true
        },
        UPDATE_BY: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false,
    }
);

ScanSewing.removeAttribute("id");
SewingSiteLine.removeAttribute("id");

export const SewingWorkdoneByDate = `SELECT * FROM ViewWorkdoneSewing WHERE ScanDate BETWEEN :startDate AND :endDate`;