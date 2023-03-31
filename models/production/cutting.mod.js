import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanCutting = db.define(
  "order_scan_log",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    CUTTING_SCANTIME: {
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

export const GenerateQR = db.define(
  "order_qr_generate",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    BUNDLE_SEQUENCE: {
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    SITE_LINE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    CREATE_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CREATE_BY: {
      type: DataTypes.INTEGER(20),
      allowNull: true,
    },
    UPDATE_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    UPDATE_BY: {
      type: DataTypes.INTEGER(20),
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

GenerateQR.removeAttribute("id");
ScanCutting.removeAttribute("id");

export const OrderDetailList = `SELECT * FROM vieworderdetaillist WHERE UPLOAD_DATE BETWEEN :startDate AND :endDate`;

export const SelectOrderNo = `SELECT DISTINCT 
a.BUYER_CODE, a.ORDER_NO, a.PRODUCT_TYPE, a.BUYER_PO, a.MO_NO, a.ORDER_VERSION, a.SHIPMENT_DATE,
a.ORDER_QTY, a.ORDER_SIZE, a.ORDER_STYLE, a.BARCODE_SERIAL, a.SITE_LINE, b.ITEM_COLOR_NAME, SUBSTRING_INDEX(b.ORDER_REFERENCE_PO_NO, ' ', 1) ORDER_REF, b.COUNTRY
FROM order_detail a 
LEFT JOIN (
	SELECT * FROM order_po_listing c WHERE c.ORDER_NO = :orderNo
	) b ON b.MO_NO = a.MO_NO
WHERE a.ORDER_NO = :orderNo ORDER BY  a.ORDER_SIZE, a.BARCODE_SERIAL`;

export const CuttingWorkdoneByDate = `SELECT * FROM ViewWorkdoneCutting WHERE ScanDate BETWEEN :startDate AND :endDate`;

export const CuttinScanSewingIn = db.define(
  "scan_sewing_in",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    SCH_ID: { type: DataTypes.BIGINT },
    SCHD_ID: { type: DataTypes.BIGINT },
    SEWING_SCAN_BY: { type: DataTypes.BIGINT },
    SEWING_SCAN_LOCATION: { type: DataTypes.STRING },
    SEWING_SCAN_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "SEWING_SCAN_TIME",
    updatedAt: false,
  }
);

export const QryCutScanInWithSize = `SELECT a.SCH_ID, a.SCHD_ID, b.ORDER_QTY, b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, g.SCHD_SITE SITE_NAME, e.LINE_NAME,
b.ORDER_NO, a.BARCODE_SERIAL, b.ORDER_SIZE, b.ORDER_QTY, f.BUNDLE_SEQUENCE 
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
LEFT JOIN order_qr_generate f ON f.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE a.BARCODE_SERIAL = :qrcode `;

export const QueryCheckQcOut = `SELECT a.ENDLINE_SCHD_DATE, a.PLANSIZE_ID, a.ENDLINE_PLAN_SIZE, a.ENDLINE_SCHD_ID, a.ENDLINE_ACT_SCHD_ID
FROM qc_endline_output a
WHERE a.ENDLINE_PLAN_SIZE = :sizeCode 
AND  a.ENDLINE_SCHD_ID = :schdId`;
