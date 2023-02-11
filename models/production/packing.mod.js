import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanPackingIn = db.define(
  "scan_packing_in",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    SCHD_ID: { type: DataTypes.BIGINT },
    SCH_ID: { type: DataTypes.BIGINT },
    PACKING_SCAN_BY: { type: DataTypes.BIGINT },
    PACKING_SCAN_LOCATION: { type: DataTypes.STRING },
    PACKING_SCAN_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "PACKING_SCAN_TIME",
    updatedAt: false,
  }
);

export const PackingWorkdoneByDate = `SELECT * FROM ViewWorkdonePacking WHERE ScanDate BETWEEN :startDate AND :endDate`;

export const FindTransferData = `SELECT  N.BUYER_CODE, N.SCHD_ID, N.SCH_ID, N.ORDER_NO, N.PRODUCT_TYPE, N.BUYER_PO, N.MO_NO,N.ORDER_REF,
N.ORDER_COLOR, N.ORDER_SIZE, N.ORDER_QTY, N.ORDER_STYLE, N.BARCODE_SERIAL, N.SITE_LINE_FX, 
CONCAT(f.SITE_NAME, ' ', f.LINE_NAME) SITE_LINE, N.SEWING_SCAN_TIME, N.SCHD_PROD_DATE
FROM  (
SELECT DISTINCT a.BARCODE_SERIAL, a.SCHD_ID, a.SCH_ID, d.SCHD_ID_SITELINE, b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, 
c.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_SIZE, b.ORDER_QTY, b.ORDER_STYLE, b.SITE_LINE SITE_LINE_FX, b.SHIPMENT_DATE,
c.ORDER_REFERENCE_PO_NO ORDER_REF,
SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, 
SUBSTRING_INDEX(b.SITE_LINE,' ',1) SITE, 
SUBSTRING_INDEX(b.SITE_LINE,' ',-1)  LINE,
a.SEWING_SCAN_TIME, d.SCHD_PROD_DATE
FROM scan_sewing_out a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1)
LEFT JOIN weekly_prod_sch_detail d ON a.SCHD_ID = d.SCHD_ID
WHERE a.BARCODE_SERIAL = :barcodeserial
) N LEFT JOIN item_siteline f ON f.ID_SITELINE = N.SCHD_ID_SITELINE`;

export const QueryResPackScanIn = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, CONCAT(g.SCHD_SITE,' ',e.LINE_NAME)  SITE_LINE,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE, 
b.ORDER_QTY, a.PACKING_SCAN_BY, d.USER_INISIAL, b.SHIPMENT_DATE, g.SCHD_PROD_DATE, DATE(a.PACKING_SCAN_TIME) SCAN_DATE, TIME(a.PACKING_SCAN_TIME) SCAN_TIME
FROM scan_packing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.PACKING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE DATE(a.PACKING_SCAN_TIME) = :scanDate AND 
e.LINE_NAME LIKE :linename AND a.BARCODE_SERIAL LIKE :barcodeserial
ORDER BY a.PACKING_SCAN_TIME`;
