import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanCutting = db.define(
  "order_scan_log", {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    CUTTING_SCANTIME: {
      type: DataTypes.NOW,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false
  }
);


ScanCutting.removeAttribute("id");

export default ScanCutting;

export const OrderDetailList = `SELECT a.BUYER_CODE, a.ORDER_NO, a.MO_NO, SUM(a.ORDER_QTY) QTY, a.DATE_CREATE
FROM order_detail a GROUP BY a.BUYER_CODE, a.ORDER_NO WHERE DATE(a.CREATE_DATE) BETWEEN :startDate AND :endDate
ORDER BY a.DATE_CREATE DESC`;

export const SelectOrderNo = `SELECT DISTINCT 
a.BUYER_CODE, a.ORDER_NO, a.PRODUCT_TYPE, a.BUYER_PO, a.MO_NO, a.ORDER_VERSION, a.SHIPMENT_DATE,
a.ORDER_QTY, a.ORDER_SIZE, a.ORDER_STYLE, a.BARCODE_SERIAL, a.SITE_LINE, b.ITEM_COLOR_NAME, SUBSTRING_INDEX(b.ORDER_REFERENCE_PO_NO, ' ', 1) ORDER_REF, b.COUNTRY
FROM order_detail a 
LEFT JOIN (
	SELECT * FROM order_po_listing c WHERE c.ORDER_NO = :orderNo
	) b ON b.MO_NO = a.MO_NO
WHERE a.ORDER_NO = :orderNo ORDER BY  a.ORDER_SIZE, a.BARCODE_SERIAL`;

export const CuttingWorkdoneByDate = `SELECT
    order_detail.BUYER_CODE AS BuyersCode,
    order_scan_log.BARCODE_SERIAL AS BarcodeSerial,
    order_detail.ORDER_NO AS OrderNumber,
    order_detail.BUYER_PO AS BuyerPO,
    order_detail.MO_NO AS MONumber,
    DATE_FORMAT(order_scan_log.CUTTING_SCAN_TIME, '%Y-%m-%d') AS ScanDate,
    TIME_FORMAT(order_scan_log.CUTTING_SCAN_TIME, "%H:%i:%s") AS ScanTime,
    order_detail.ORDER_QTY AS Qty,
    '1' AS StepID,
    SUBSTRING(order_scan_log.CUTTING_SCAN_LOCATION, 1, 5) AS Site,
    order_scan_log.CUTTING_SCAN_LOCATION AS Line
FROM order_scan_log
INNER JOIN order_detail ON order_scan_log.BARCODE_SERIAL=order_detail.BARCODE_SERIAL
WHERE DATE(order_scan_log.CUTTING_SCAN_TIME) BETWEEN :startDate AND :endDate ORDER BY order_scan_log.CUTTING_SCAN_TIME`;