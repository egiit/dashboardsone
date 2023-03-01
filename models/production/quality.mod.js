import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanQuality = db.define(
  "order_scan_log",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    QC_SCANTIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

ScanQuality.removeAttribute("id");

export const QCWorkdoneByDate = `SELECT * FROM ViewWorkdoneQC WHERE ScanDate BETWEEN :startDate AND :endDate`;

export const QcType = db.define(
  "qc_inspection_type",
  {
    QC_TYPE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    QC_TYPE_NAME: { type: DataTypes.STRING, allowNull: false },
    QC_TYPE_ADD_ID: { type: DataTypes.INTEGER },
    QC_TYPE_MOD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export const QcRemarks = db.define(
  "qc_endline_remark",
  {
    SCHD_ID: {
      type: DataTypes.INTEGER,
    },
    ID_SITELINE: { type: DataTypes.STRING, allowNull: false },
    TYPE_PROD: { type: DataTypes.STRING, allowNull: false },
    REMARK: { type: DataTypes.TEXT },
    PROD_DATE: { type: DataTypes.DATE },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    ADD_DATE: { type: DataTypes.DATE },
    MOD_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_DATE",
    updatedAt: "MOD_DATE",
  }
);

QcRemarks.removeAttribute("id");

export const QcUsers = db.define(
  "qc_inspection_user",
  {
    QC_USER_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    QC_USERNAME: { type: DataTypes.STRING, allowNull: false },
    QC_NAME: { type: DataTypes.STRING },
    QC_TYPE_ID: { type: DataTypes.INTEGER },
    SITE_NAME: { type: DataTypes.STRING },
    ID_SITELINE: { type: DataTypes.STRING },
    QC_USER_PASSWORD: { type: DataTypes.STRING },
    QC_USER_REF_TOKEN: { type: DataTypes.STRING },
    QC_USER_ACTIVE: { type: DataTypes.STRING },
    QC_USER_ADD_ID: { type: DataTypes.INTEGER },
    QC_USER_DEL: { type: DataTypes.INTEGER },
    QC_USER_MOD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export const QueryGetListUserQc = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_TYPE_ID, c.QC_TYPE_NAME, a.ID_SITELINE,  b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.QC_USER_ACTIVE, a.QC_USER_DEL FROM qc_inspection_user a
LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
LEFT JOIN qc_inspection_type c ON c.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1'
`;

export const QueryGetUserQc = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_USER_PASSWORD, a.QC_USER_REF_TOKEN, a.QC_TYPE_ID,
c.QC_TYPE_NAME, a.ID_SITELINE,  b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.QC_USER_ACTIVE, a.QC_USER_DEL 
FROM qc_inspection_user a
LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
LEFT JOIN qc_inspection_type c ON c.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1' AND a.QC_USERNAME = :userNameQc`;

export const QueryGetUserQcReftok = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_USER_PASSWORD, a.QC_USER_REF_TOKEN, a.QC_TYPE_ID,
c.QC_TYPE_NAME, a.ID_SITELINE,  b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.QC_USER_ACTIVE, a.QC_USER_DEL 
FROM qc_inspection_user a
LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
LEFT JOIN qc_inspection_type c ON c.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1' AND a.QC_USER_REF_TOKEN = :reftoken`;

export const QueryGetListPart = `SELECT a.PART_CODE, a.PART_NAME FROM item_part a ORDER BY a.PART_ORDER`;
export const QueryGetListDefect = `SELECT a.DEFECT_SEW_CODE, a.DEFECT_NAME FROM item_defect_internal a WHERE a.DEFECT_SEW_CODE IS NOT NULL`;

export const QcEndlineOutput = db.define(
  "qc_endline_output",
  {
    ENDLINE_OUT_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    PLANSIZE_ID: { type: DataTypes.INTEGER },
    ENDLINE_OUT_TYPE: { type: DataTypes.STRING, allowNull: false },
    ENDLINE_PORD_TYPE: { type: DataTypes.STRING, allowNull: false },
    ENDLINE_PLAN_SIZE: { type: DataTypes.STRING, allowNull: false },
    ENDLINE_OUT_QTY: { type: DataTypes.INTEGER },
    ENDLINE_DEFECT_CODE: { type: DataTypes.STRING },
    ENDLINE_PART_CODE: { type: DataTypes.STRING },
    ENDLINE_ID_SITELINE: { type: DataTypes.STRING },
    ENDLINE_LINE_NAME: { type: DataTypes.STRING },
    ENDLINE_SCH_ID: { type: DataTypes.INTEGER },
    ENDLINE_SCHD_ID: { type: DataTypes.INTEGER },
    ENDLINE_ACT_SCHD_ID: { type: DataTypes.INTEGER },
    ENDLINE_ACT_RPR_SCHD_ID: { type: DataTypes.INTEGER },
    ENDLINE_SCHD_DATE: { type: DataTypes.DATE },
    ENDLINE_SEQUANCE: { type: DataTypes.INTEGER },
    ENDLINE_TIME: { type: DataTypes.TIME },
    ENDLINE_OUT_UNDO: { type: DataTypes.STRING },
    ENDLINE_REPAIR: { type: DataTypes.STRING },
    ENDLINE_ADD_ID: { type: DataTypes.INTEGER },
    ENDLINE_MOD_ID: { type: DataTypes.INTEGER },
    ENDLINE_ADD_TIME: { type: DataTypes.DATE },
    ENDLINE_MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ENDLINE_ADD_TIME",
    updatedAt: "ENDLINE_MOD_TIME",
  }
);

export const getEndllineQROutput = `SELECT *, M.RTT+M.DEFECT+M.REPAIRED+M.BS AS TOTAL_CHECKED  FROM (
	SELECT SUM(N.RTT) RTT, SUM(N.DEFECT) DEFECT, SUM(N.REPAIRED) REPAIRED, SUM(N.BS) BS FROM
	(
		SELECT SUM(a.ENDLINE_OUT_QTY) RTT, 0 DEFECT, 0 REPAIRED, 0 BS  FROM   qc_endline_output a
		WHERE a.ENDLINE_SCHD_ID = :schdid AND a.ENDLINE_PLAN_SIZE = :size AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL
		UNION ALL 
		SELECT 0 RTT, SUM(a.ENDLINE_OUT_QTY) DEFECT, 0 REPAIRED, 0 BS  FROM   qc_endline_output a
		WHERE a.ENDLINE_SCHD_ID = :schdid AND a.ENDLINE_PLAN_SIZE = :size  AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR IS NULL
		UNION ALL
		SELECT 0 RTT, 0 DEFECT, 0 REPAIRED, SUM(a.ENDLINE_OUT_QTY) BS  FROM   qc_endline_output a
		WHERE a.ENDLINE_SCHD_ID = :schdid AND a.ENDLINE_PLAN_SIZE = :size  AND a.ENDLINE_OUT_TYPE = 'BS' AND a.ENDLINE_OUT_UNDO IS NULL
		UNION ALL
		SELECT 0 RTT, 0 DEFECT, SUM(a.ENDLINE_OUT_QTY) REPAIRED, 0 BS  FROM   qc_endline_output a
		WHERE a.ENDLINE_SCHD_ID = :schdid AND a.ENDLINE_PLAN_SIZE = :size  AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y'
	) N
) M`;

//get data planning size di endline berdasarkan size yang sudah di scan, grouping by size
export const QueryEndlinePlanSize = `SELECT a.SCH_ID, a.SCHD_ID,  i.PLANSIZE_ID, b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, g.SCHD_SITE SITE_NAME, e.LINE_NAME,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE,
b.ORDER_SIZE, SUM(b.ORDER_QTY) QTY, l.TFR_QTY, COUNT(*) BDL_TOTAL, (k.RTT+k.REPAIRED) GOOD, k.RTT, k.DEFECT, k.REPAIRED, k.BS, k.TOTAL_CHECKED, 
g.SCHD_PROD_DATE, u.UNDO_RTT, u.UNDO_DEFECT, u.UNDO_BS, u.UNDO_REPAIR
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.SEWING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN qc_endline_plansize i ON i.SCHD_ID = a.SCHD_ID AND i.ORDER_SIZE = b.ORDER_SIZE
LEFT JOIN qc_endline_undo u ON u.SCHD_ID = g.SCHD_ID AND i.PLANSIZE_ID = u.PLANSIZE_ID AND u.USER_ID = :userId
LEFT JOIN (
		SELECT a.SCH_ID, a.SCHD_ID, b.ORDER_STYLE, b.ORDER_SIZE, b.ORDER_COLOR,  SUM(b.ORDER_QTY) TFR_QTY
		FROM scan_sewing_out a 
		LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
		LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
		LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
		WHERE g.SCHD_PROD_DATE = :schDate AND a.SEWING_SCAN_LOCATION = :sitename AND 
		e.LINE_NAME LIKE :linename
		GROUP BY a.SCH_ID, a.SCHD_ID, b.ORDER_STYLE, b.ORDER_SIZE, b.ORDER_COLOR
) l ON l.SCHD_ID = a.SCHD_ID AND b.ORDER_SIZE = l.ORDER_SIZE AND b.ORDER_COLOR = l.ORDER_COLOR
LEFT JOIN (
		SELECT ENDLINE_SCHD_ID, ENDLINE_PLAN_SIZE,  SUM(N.RTT) RTT, SUM(N.DEFECT) DEFECT, SUM(N.REPAIRED) REPAIRED, SUM(N.BS) BS, SUM(N.TOTAL_CHECKED) TOTAL_CHECKED FROM
	(
		SELECT a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE, SUM(a.ENDLINE_OUT_QTY) RTT, 0 DEFECT, 0 REPAIRED, 0 BS, 0 TOTAL_CHECKED  FROM   qc_endline_output a
		WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_LINE_NAME = :linename AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL  
		GROUP BY a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE 
		UNION ALL 
		SELECT  a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE, 0 RTT, SUM(a.ENDLINE_OUT_QTY) DEFECT, 0 REPAIRED, 0 BS, 0 TOTAL_CHECKED  FROM   qc_endline_output a
		WHERE a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR IS NULL AND a.ENDLINE_SCHD_DATE = :schDate  AND a.ENDLINE_LINE_NAME = :linename
		GROUP BY a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE 
		UNION ALL
		SELECT  a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE, 0 RTT, 0 DEFECT, 0 REPAIRED, SUM(a.ENDLINE_OUT_QTY) BS , 0 TOTAL_CHECKED  FROM   qc_endline_output a
		WHERE a.ENDLINE_OUT_TYPE = 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_SCHD_DATE = :schDate  AND a.ENDLINE_LINE_NAME = :linename
		GROUP BY a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE 
		UNION ALL
		SELECT  a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE, 0 RTT, 0 DEFECT, SUM(a.ENDLINE_OUT_QTY) REPAIRED, 0 BS , 0 TOTAL_CHECKED FROM   qc_endline_output a
		WHERE a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND  a.ENDLINE_REPAIR = 'Y'  AND a.ENDLINE_SCHD_DATE = :schDate  AND a.ENDLINE_LINE_NAME = :linename
		GROUP BY a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE
			UNION ALL 
		SELECT a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE, 0 RTT, 0 DEFECT, 0 REPAIRED, 0 BS,  SUM(a.ENDLINE_OUT_QTY) TOTAL_CHECKED  FROM   qc_endline_output a
		WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_LINE_NAME = :linename AND a.ENDLINE_OUT_UNDO IS NULL  
		GROUP BY a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE 
	) N
	GROUP BY N.ENDLINE_SCHD_ID, N.ENDLINE_PLAN_SIZE
) k ON k.ENDLINE_SCHD_ID = a.SCHD_ID AND  k.ENDLINE_PLAN_SIZE = b.ORDER_SIZE
WHERE g.SCHD_PROD_DATE = :schDate AND a.SEWING_SCAN_LOCATION = :sitename AND 
e.LINE_NAME LIKE :linename
GROUP BY a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, b.SITE_LINE, g.SCHD_SITE, e.LINE_NAME,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO, f.ITEM_COLOR_NAME, b.ORDER_STYLE, b.ORDER_SIZE`;

//get data defect for repaired
export const QueryGetDefForRepair = `SELECT a.ENDLINE_OUT_ID, a.ENDLINE_SCHD_ID, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE,
c.PART_NAME, b.DEFECT_NAME, 
 a.ENDLINE_SCHD_DATE, DATE(a.ENDLINE_ADD_TIME) ADD_DATE, a.ENDLINE_TIME , a.ENDLINE_ID_SITELINE
FROM   qc_endline_output a
LEFT JOIN item_defect_internal b ON b.DEFECT_SEW_CODE = a.ENDLINE_DEFECT_CODE
LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
WHERE a.ENDLINE_SCHD_ID = :schdid AND a.ENDLINE_PLAN_SIZE = :size 
AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR IS NULL
ORDER BY a.ENDLINE_TIME`;

//plan size for undo and history
export const PlanSize = db.define(
  "qc_endline_plansize",
  {
    PLANSIZE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    SCH_ID: { type: DataTypes.INTEGER, allowNull: false },
    SCHD_ID: { type: DataTypes.INTEGER, allowNull: false },
    SCHD_PROD_DATE: { type: DataTypes.DATE, allowNull: false },
    // BUYER_CODE: { type: DataTypes.STRING },
    // SITE_NAME: { type: DataTypes.STRING },
    // LINE_NAME: { type: DataTypes.STRING },
    // ORDER_NO: { type: DataTypes.STRING },
    // MO_NO: { type: DataTypes.STRING },
    // ORDER_REF: { type: DataTypes.STRING },
    // ORDER_COLOR: { type: DataTypes.STRING },
    // ORDER_STYLE: { type: DataTypes.STRING },
    ORDER_SIZE: { type: DataTypes.STRING, allowNull: false },
    LINE_NAME: { type: DataTypes.STRING },
    SITE_NAME: { type: DataTypes.STRING },
    COMPLETE_STATUS: { type: DataTypes.STRING },
    // QTY: { type: DataTypes.INTEGER },
    // BDL_TOTAL: { type: DataTypes.INTEGER },
    BDL_TOTAL: { type: DataTypes.INTEGER },
    QTY: { type: DataTypes.INTEGER },
    RTT: { type: DataTypes.INTEGER },
    DEFECT: { type: DataTypes.INTEGER },
    BS: { type: DataTypes.INTEGER },
    REPAIRED: { type: DataTypes.INTEGER },
    // UNDO_RTT: { type: DataTypes.INTEGER },
    // UNDO_DEFECT: { type: DataTypes.INTEGER },
    // UNDO_BS: { type: DataTypes.INTEGER },
    // UNDO_REPAIR: { type: DataTypes.INTEGER },
    PLANSIZE_ADD_ID: { type: DataTypes.INTEGER },
    PLANSIZE_MOD_ID: { type: DataTypes.INTEGER },
    PLANSIZE_ADD_TIME: { type: DataTypes.DATE },
    PLANSIZE_MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "PLANSIZE_ADD_TIME",
    updatedAt: "PLANSIZE_MOD_TIME",
  }
);

//qc endline undo
export const EndlineUndo = db.define(
  "qc_endline_undo",
  {
    PLANSIZE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    SCHD_ID: { type: DataTypes.INTEGER, allowNull: false },
    USER_ID: { type: DataTypes.INTEGER, allowNull: false },
    UNDO_RTT: { type: DataTypes.INTEGER },
    UNDO_DEFECT: { type: DataTypes.INTEGER },
    UNDO_BS: { type: DataTypes.INTEGER },
    UNDO_REPAIR: { type: DataTypes.INTEGER },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    ADD_DATE: { type: DataTypes.DATE },
    MOD_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_DATE",
    updatedAt: "MOD_DATE",
  }
);
EndlineUndo.removeAttribute("id");
//query for find last record Defect RTT BS
export const QueryGetLastRttDefBS = `SELECT * FROM qc_endline_output a 
WHERE a.ENDLINE_SCHD_ID = :schdid 
  AND a.ENDLINE_OUT_TYPE = :type  
  AND a.ENDLINE_PLAN_SIZE = :size
  AND a.ENDLINE_PORD_TYPE = :prodtype
  AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR IS NULL 
ORDER BY a.ENDLINE_OUT_ID DESC LIMIT 1`;

//query for fin last record Repaird
export const QueryGetLastRepaird = `SELECT * FROM qc_endline_output a 
WHERE a.ENDLINE_SCHD_ID = :schdid 
  AND a.ENDLINE_OUT_TYPE = 'DEFECT' 
  AND a.ENDLINE_PLAN_SIZE = :size
  AND a.ENDLINE_PORD_TYPE = :prodtype
AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y'
ORDER BY a.ENDLINE_OUT_ID DESC LIMIT 1`;

export const QueryPlanSizePending = `SELECT a.SCH_ID, a.SCHD_ID,  a.PLANSIZE_ID, f.CUSTOMER_NAME BUYER_CODE, e.SITE_NAME, e.LINE_NAME, 
f.ORDER_NO, f.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, f.ORDER_STYLE_DESCRIPTION ORDER_STYLE,
 a.SCHD_PROD_DATE, a.LINE_NAME, a.SITE_NAME, a.ORDER_SIZE, a.COMPLETE_STATUS, l.TFR_QTY, a.BDL_TOTAL,
a.QTY, a.RTT, a.DEFECT, a.BS, a.REPAIRED , u.UNDO_RTT, u.UNDO_DEFECT, u.UNDO_BS, u.UNDO_REPAIR,
( a.RTT+a.REPAIRED) GOOD,
( a.RTT+a.DEFECT+a.BS+a.REPAIRED) TOTAL_CHECKED, i.NOTYET_TFR_BARCODE
FROM  qc_endline_plansize a 
LEFT JOIN weekly_prod_sch_detail b ON a.SCHD_ID = b.SCHD_ID 
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = b.SCHD_CAPACITY_ID
LEFT JOIN item_siteline e ON e.ID_SITELINE = b.SCHD_ID_SITELINE
LEFT JOIN viewsewingtfrqty l ON l.SCHD_ID = a.SCHD_ID AND a.ORDER_SIZE = l.ORDER_SIZE
LEFT JOIN qc_endline_undo u ON a.PLANSIZE_ID = u.PLANSIZE_ID AND u.USER_ID = :userId
LEFT JOIN (
-- QUERY INI UNTNUK CARI DATA QR YANG BELUM DI TFR
		SELECT N.SCH_ID, N.SCHD_ID, N.BUYER_CODE, N.SITE_NAME, 
		N.LINE_NAME, N.ORDER_COLOR, N.ORDER_STYLE, N.ORDER_SIZE, 
		N.ORDER_QTY, N.SCHD_PROD_DATE, COUNT(N.BARCODE_SERIAL) NOTYET_TFR_BARCODE
		FROM (
		   SELECT a.BARCODE_SERIAL, a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, g.SCHD_SITE SITE_NAME, 
		   e.LINE_NAME, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE, 
		   b.ORDER_QTY, g.SCHD_PROD_DATE, 
		   i.BARCODE_SERIAL BARCODE_TRANSFER
		   FROM scan_sewing_in a
		   LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
		   LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
		   LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
		   LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
		   LEFT JOIN scan_sewing_out i ON i.BARCODE_SERIAL = a.BARCODE_SERIAL
		   WHERE g.SCHD_PROD_DATE < DATE(:schDate) AND a.SEWING_SCAN_LOCATION = :sitename AND 
		   e.LINE_NAME = :linename AND ISNULL(i.BARCODE_SERIAL) 
		) N 
		GROUP BY N.SCH_ID, N.SCHD_ID, N.BUYER_CODE, N.SITE_NAME, 
		N.LINE_NAME, N.ORDER_COLOR, N.ORDER_STYLE, N.ORDER_SIZE, 
		 N.SCHD_PROD_DATE
) i ON i.SCHD_ID = a.SCHD_ID AND a.ORDER_SIZE = i.ORDER_SIZE AND  f.ITEM_COLOR_NAME = i.ORDER_COLOR
WHERE a.SCHD_PROD_DATE < DATE(:schDate) AND a.SITE_NAME = :sitename 
AND a.LINE_NAME = :linename AND i.NOTYET_TFR_BARCODE IS NOT NULL`;

export const QueryGetQrPendding = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, b.SITE_LINE, g.SCHD_SITE SITE_NAME, e.LINE_NAME,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE, 
b.ORDER_QTY, a.SEWING_SCAN_BY, d.USER_INISIAL, g.SCHD_PROD_DATE, DATE(a.SEWING_SCAN_TIME) SCAN_DATE, TIME(a.SEWING_SCAN_TIME) SCAN_TIME, 
i.BARCODE_SERIAL BARCODE_TRANSFER, DATE(a.SEWING_SCAN_TIME) TRANSFER_DATE, TIME(i.SEWING_SCAN_TIME) TRANSFER_TIME	
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.SEWING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN scan_sewing_out i ON i.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE g.SCHD_PROD_DATE < :schDate AND a.SEWING_SCAN_LOCATION = :sitename  AND 
e.LINE_NAME = :linename AND ISNULL(i.BARCODE_SERIAL) 
ORDER BY  b.ORDER_SIZE, h.BUNDLE_SEQUENCE`;
