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

ScanSewing.removeAttribute("id");

export default ScanSewing;