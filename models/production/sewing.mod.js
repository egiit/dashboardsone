import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanSewing = db.define(
  "order_scan_log",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    SEWING_SCANTIME: {
      type: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

ScanSewing.removeAttribute("id");

export const SewingListSite = `SELECT DISTINCT a.SITE, a.SITE_NAME FROM item_siteline a`;
export const SewingListLine = `SELECT a.ID_SITELINE, a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME, a.SHIFT FROM item_siteline a`;
export const SewingWorkdoneByDate = `SELECT * FROM ViewWorkdoneSewing WHERE ScanDate BETWEEN :startDate AND :endDate`;
