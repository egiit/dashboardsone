import { DataTypes } from "sequelize";
import db from "../../config/database.js";


export const ScanPacking = db.define(
    "order_scan_log", {
        BARCODE_SERIAL: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        PACKING_SCANTIME: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false,
      }
);

ScanPacking.removeAttribute("id");