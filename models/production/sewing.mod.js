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

export const SewingWorkdoneByDate = `SELECT
    order_detail.BUYER_CODE AS BuyersCode,
    order_scan_log.BARCODE_SERIAL AS BarcodeSerial,
    order_detail.ORDER_NO AS OrderNumber,
    order_detail.BUYER_PO AS BuyerPO,
    order_detail.MO_NO AS MONumber,
    DATE_FORMAT(order_scan_log.SEWING_SCAN_TIME, '%Y-%m-%d') AS ScanDate,
    TIME_FORMAT(order_scan_log.SEWING_SCAN_TIME, "%H:%i:%s") AS ScanTime,
    order_detail.ORDER_QTY AS Qty,
    '2' AS StepID,
    SUBSTRING(order_scan_log.SEWING_SCAN_LOCATION, 1, 5) AS Site,
    order_scan_log.SEWING_SCAN_LOCATION AS Line
FROM order_scan_log
INNER JOIN order_detail ON order_scan_log.BARCODE_SERIAL=order_detail.BARCODE_SERIAL
WHERE DATE(order_scan_log.SEWING_SCAN_TIME) BETWEEN :startDate AND :endDate ORDER BY order_scan_log.SEWING_SCAN_TIME`;