import { DataTypes } from "sequelize";
import db from "../../config/database.js";


export const ScanCutting = db.define(
  "order_scan_log", {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    CUTTING_SCANTIME: {
      type: DataTypes.NOW,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

ScanCutting.removeAttribute("id");

export default ScanCutting;
