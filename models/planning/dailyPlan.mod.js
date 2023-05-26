import db from "../../config/database.js";
import { DataTypes } from "sequelize";

export const QueryDailyPlann = `SELECT *, n.NORMAL_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
n.OT_MP*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
n.OT_X_MP*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT
 FROM (
	SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT,
	b.ORDER_REFERENCE_PO_NO, d.FOREMAN, 
	a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, 
	IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY, 
	b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
	b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.PRODUCT_ITEM_DESCRIPTION,  
	FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
	CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP, m.ACT_MP,
	CASE WHEN ISNULL(f.PLAN_WH) THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH, 
	m.PLAN_MP_OT, f.PLAN_WH_OT, m.PLAN_MP_X_OT, f.PLAN_WH_X_OT, 
	FIND_ACT_MP(m.ACT_MP, m.PLAN_MP, e.PLAN_MP) NORMAL_MP, -- mp normal untuk menghitung target normal
	FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) OT_MP, -- mp ot untuk menghitung target overtime
	FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) OT_X_MP, -- mp  untuk menghitung target extra ovrtime
	o.PLAN_REMARK
	FROM weekly_prod_sch_detail a
	LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
	LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
	-- untuk aktual SMV
	LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
	LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
	LEFT JOIN 	(
	-- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
		SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_WH, a.PLAN_MP, a.ACT_WH, a.ACT_MP, a.OT_WH, a.OT_MP
		FROM manpower_detail a 
		LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
		WHERE a.MP_DATE = :plannDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift
		ORDER by a.ID_SITELINE
	) e ON e.LINE_NAME = d.LINE_NAME
	-- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
	LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
	LEFT JOIN (
		SELECT DISTINCT a.SCHD_ID, a.LINE_NAME, a.SHIFT, a.PLAN_MP, a.ACT_MP, a.PLAN_MP_OT, a.ACT_MP_OT, a.PLAN_MP_X_OT, a.ACT_MP_X_OT 
		FROM   mp_daily_detail a  WHERE a.SHIFT = :shift AND DATE(a.CREATE_DATE) = :plannDate
		GROUP BY a.SCHD_ID, a.LINE_NAME, a.SHIFT
	) m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift
	LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift
	WHERE a.SCHD_PROD_DATE = :plannDate  AND e.MP_DATE = :plannDate AND d.SITE_NAME =  :sitename 
)n `;

// export const QueryDailySchSewIn = `SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, d.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, d.SHIFT,
// b.ORDER_REFERENCE_PO_NO, d.FOREMAN, a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, a.SCHD_QTY, e.SCH_QTY, b.MO_QTY, IF(e.SCH_QTY = b.MO_QTY , 'ALL' ,'PARTIAL') SIZE,
// b.ORDER_NO, b.MO_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE,
// b.ITEM_COLOR_CODE, b.ITEM_COLOR_NAME, b.PRODUCT_ITEM_DESCRIPTION
// FROM weekly_prod_sch_detail a
// LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY
// LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
// LEFT JOIN weekly_prod_schedule e ON a.SCH_ID = e.SCH_ID
// WHERE a.SCHD_PROD_DATE = :plannDate AND a.SCHD_SITE = :sitename
// ORDER BY d.ID_SITELINE,  b.CUSTOMER_NAME`;

export const QueryCheckSchdScan = `SELECT a.SCHD_ID, a.SCH_ID, f.PDM_ID, a.SCHD_PROD_DATE, b.CUSTOMER_NAME, 
b.ORDER_NO, b.MO_NO, d.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME,
b.CUSTOMER_NAME, b.PRODUCT_ITEM_CODE, b.ORDER_REFERENCE_PO_NO, b.ITEM_COLOR_CODE, b.ITEM_COLOR_NAME, 
b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, f.SIZE_CODE 
FROM weekly_prod_sch_detail a
LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY
LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
LEFT JOIN view_weekly_sch_size f ON a.SCH_ID = f.SCH_ID
-- LEFT JOIN po_matrix_delivery g ON f.PDM_ID = g.PDM_ID 
WHERE a.SCHD_PROD_DATE = :plannDate AND a.SCHD_SITE = :sitename AND d.LINE_NAME = :lineName
AND b.MO_NO = :moNo AND  b.ORDER_STYLE_DESCRIPTION = :styleDesc AND b.ITEM_COLOR_NAME = :colorCode
AND f.SIZE_CODE = :sizeCode`;
// export const QueryCheckSchdScan = `SELECT a.SCHD_ID, a.SCH_ID, g.PDM_ID, a.SCHD_PROD_DATE, b.CUSTOMER_NAME,
// b.ORDER_NO, b.MO_NO, d.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME,
// b.CUSTOMER_NAME, b.PRODUCT_ITEM_CODE, b.ORDER_REFERENCE_PO_NO, b.ITEM_COLOR_CODE, b.ITEM_COLOR_NAME,
// b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, g.SIZE_CODE
// FROM weekly_prod_sch_detail a
// LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY
// LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
// LEFT JOIN weekly_sch_size f ON a.SCH_ID = f.SCH_ID
// LEFT JOIN po_matrix_delivery g ON f.PDM_ID = g.PDM_ID
// WHERE a.SCHD_PROD_DATE = :plannDate AND a.SCHD_SITE = :sitename AND d.LINE_NAME = :lineName
// AND b.MO_NO = :moNo AND  b.ORDER_STYLE_DESCRIPTION = :styleDesc AND b.ITEM_COLOR_NAME = :colorCode
// AND g.SIZE_CODE = :sizeCode`;

export const QueryfindQrSewingIn = `SELECT  N.BUYER_CODE, N.ORDER_NO, N.PRODUCT_TYPE, N.BUYER_PO, N.MO_NO,N.ORDER_REF,
N.ORDER_COLOR, N.ORDER_SIZE, N.ORDER_QTY, N.ORDER_STYLE, N.BARCODE_SERIAL, N.SITE_LINE_FX, b.SITE_NAME, b.LINE_NAME 
FROM  (
	SELECT DISTINCT a.BARCODE_SERIAL, b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, c.ORDER_REFERENCE_PO_NO ORDER_REF,
	c.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_SIZE, b.ORDER_QTY, b.ORDER_STYLE, b.SITE_LINE SITE_LINE_FX, 
   SUBSTRING_INDEX(b.SITE_LINE,' ',1) SITE, SUBSTRING_INDEX(b.SITE_LINE,' ',-1)  LINE
	FROM order_qr_generate a
	LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
	LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1)
	WHERE a.BARCODE_SERIAL = :barcodeserial
) N LEFT JOIN item_siteline b ON b.SITE = N.SITE AND b.LINE = N.LINE`;

// with extra ot
export const QueryQcEndlineDaily = `SELECT *,ROUND(n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV) PLAN_TARGET,
ROUND(n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV) PLAN_TARGET_OT,
ROUND(n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV) PLAN_TARGET_X_OT,
ROUND(n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV) ACT_TARGET,
ROUND(n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV) ACT_TARGET_OT,
ROUND(n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV) ACT_TARGET_X_OT
FROM (
	SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT,
	b.ORDER_REFERENCE_PO_NO,
	a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, a.SCHD_QTY, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
	b.ITEM_COLOR_CODE, b.ITEM_COLOR_NAME, b.PRODUCT_ITEM_DESCRIPTION,  b.ORDER_STYLE_DESCRIPTION,
	CASE WHEN ISNULL(c.ACTUAL_SEW_SMV) THEN c.PLAN_SEW_SMV ELSE c.ACTUAL_SEW_SMV END PLAN_SEW_SMV,
	CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP, 
	CASE WHEN ISNULL(f.PLAN_WH) THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH, 
	m.ACT_MP, m.PLAN_MP_OT, m.ACT_MP_OT, m.ACT_MP_X_OT, f.PLAN_WH_OT, m.PLAN_MP_X_OT, f.PLAN_WH_X_OT, 
	o.PLAN_REMARK, p.NORMAL_OUTPUT, p.OT_OUTPUT, p.X_OT_OUTPUT,	XN.NORMAL_REMARK, XN.OT_REMARK, XN.OT_X_REMARK
	FROM weekly_prod_sch_detail a
	LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
	LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
		-- untuk aktual SMV
	LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
	LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
	LEFT JOIN 	(
	-- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
		SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_WH, a.PLAN_MP, a.ACT_WH, a.ACT_MP, a.OT_WH, a.OT_MP
		FROM manpower_detail a 
		LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
		WHERE a.MP_DATE = :plannDate  AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND b.ID_SITELINE = :idstieline
		ORDER by a.ID_SITELINE
	) e ON e.LINE_NAME = d.LINE_NAME
-- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
	LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
	LEFT JOIN mp_daily_detail m ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift
	LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift
	LEFT JOIN qcendlineoutput p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID AND p.ENDLINE_ID_SITELINE = :idstieline
	LEFT JOIN (
			SELECT xc.SCHD_ID, xc.ID_SITELINE, 
		       MAX(CASE WHEN xc.TYPE_PROD = 'N' THEN xc.REMARK END) AS NORMAL_REMARK,
		       MAX(CASE WHEN xc.TYPE_PROD = 'O' THEN xc.REMARK END) AS OT_REMARK,
		       MAX(CASE WHEN xc.TYPE_PROD = 'XO' THEN xc.REMARK END) AS OT_X_REMARK
			FROM (
			    SELECT a.SCHD_ID, a.ID_SITELINE, a.TYPE_PROD, a.REMARK
			    FROM qc_endline_remark a 
			    WHERE a.PROD_DATE = :plannDate AND a.ID_SITELINE = :idstieline
			) xc
			GROUP BY xc.SCHD_ID, xc.ID_SITELINE
	) XN ON XN.SCHD_ID = a.SCHD_ID 
	WHERE a.SCHD_PROD_DATE = :plannDate   AND e.MP_DATE = :plannDate  AND d.SITE_NAME = :sitename AND d.LINE_NAME = :linename
)n `;
// export const QueryQcEndlineDaily = `SELECT *,ROUND(n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV) PLAN_TARGET,
// ROUND(n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV) PLAN_TARGET_OT,
// ROUND(n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV) ACT_TARGET,
// ROUND(n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV) ACT_TARGET_OT
// FROM (
// SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT,
// b.ORDER_REFERENCE_PO_NO, d.FOREMAN,
// a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, a.SCHD_QTY, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE,
// b.ITEM_COLOR_CODE, b.ITEM_COLOR_NAME, b.PRODUCT_ITEM_DESCRIPTION,  b.ORDER_STYLE_DESCRIPTION,
// CASE WHEN ISNULL(c.ACTUAL_SEW_SMV) THEN c.PLAN_SEW_SMV ELSE c.ACTUAL_SEW_SMV END PLAN_SEW_SMV,
// CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP,
// CASE WHEN ISNULL(f.PLAN_WH) THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH,
// m.PLAN_MP_OT, f.PLAN_WH_OT,  m.ACT_MP, m.ACT_MP_OT, o.PLAN_REMARK, p.NORMAL_OUTPUT, p.OT_OUTPUT,
// XN.NORMAL_REMARK, XN.OT_REMARK
// FROM weekly_prod_sch_detail a
// LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY
// LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
// LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
// LEFT JOIN 	(
// -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
// SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_WH, a.PLAN_MP, a.ACT_WH, a.ACT_MP, a.OT_WH, a.OT_MP
// FROM manpower_detail a
// LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
// WHERE a.MP_DATE = :plannDate  AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND b.ID_SITELINE = :idstieline
// ORDER by a.ID_SITELINE
// ) e ON e.LINE_NAME = d.LINE_NAME
// -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
// LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
// LEFT JOIN mp_daily_detail m ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift
// LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift
// LEFT JOIN qcendlineoutput p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID AND p.ENDLINE_ID_SITELINE = :idstieline
// LEFT JOIN (
// 	SELECT xc.SCHD_ID, xc.ID_SITELINE,
// 			CASE WHEN xc.TYPE_PROD = 'N'  THEN  xc.REMARK END AS NORMAL_REMARK,
// 			CASE WHEN xc.TYPE_PROD = 'O'  THEN  xc.REMARK END AS OT_REMARK
//   	FROM (
// 			SELECT a.SCHD_ID, a.ID_SITELINE, a.TYPE_PROD, a.REMARK
// 			FROM qc_endline_remark a WHERE a.PROD_DATE = :plannDate  AND a.ID_SITELINE = :idstieline
// 			)xc
// ) XN ON XN.SCHD_ID = a.SCHD_ID
// WHERE a.SCHD_PROD_DATE = :plannDate   AND e.MP_DATE = :plannDate  AND d.SITE_NAME = :sitename AND d.LINE_NAME = :linename
// )n `;

//query untuk scan bundle dari preparataion ke sewing in hampir sama kaya daily plan biasa namun ada total target
export const QueryDailySchSewIn = `SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.SCHD_ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, b.MO_NO,
b.ORDER_REFERENCE_PO_NO ORDER_REF, d.FOREMAN, 
a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, a.SCHD_QTY,  b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION ORDER_STYLE,
r.SCH_QTY, b.MO_QTY, IF(r.SCH_QTY = b.MO_QTY , 'ALL' ,'PARTIAL') SIZE
FROM weekly_prod_sch_detail a
LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
LEFT JOIN weekly_prod_schedule r ON a.SCH_ID = r.SCH_ID
WHERE a.SCHD_PROD_DATE =:plannDate AND  d.SITE_NAME = :sitename
ORDER BY d.SITE_NAME, d.LINE_NAME, a.SCHD_ID`;

export const QueryDailyPlanPackIn = `SELECT *, IF(nm.PLAN_TARGET_OT,nm.PLAN_TARGET+nm.PLAN_TARGET_OT,nm.PLAN_TARGET) TOTAl_TARGET  FROM(
	SELECT *, ROUND(n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV) PLAN_TARGET,
	ROUND(n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV) PLAN_TARGET_OT
	 FROM (
		SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.SCHD_ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT,
		b.ORDER_REFERENCE_PO_NO, a.SCHD_QTY, b.ORDER_NO, b.CUSTOMER_NAME,  b.PRODUCT_ITEM_CODE, 
		b.ITEM_COLOR_NAME, b.PRODUCT_ITEM_DESCRIPTION,  
		CASE WHEN ISNULL(c.ACTUAL_SEW_SMV) THEN c.PLAN_SEW_SMV ELSE c.ACTUAL_SEW_SMV END PLAN_SEW_SMV,
		CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP, 
		CASE WHEN ISNULL(f.PLAN_WH) THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH, 
		m.PLAN_MP_OT, f.PLAN_WH_OT, o.PLAN_REMARK
		FROM weekly_prod_sch_detail a
		LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
		LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
		LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
		LEFT JOIN 	(
		-- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
			SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_WH, a.PLAN_MP, a.ACT_WH, a.ACT_MP, a.OT_WH, a.OT_MP
			FROM manpower_detail a 
			LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
			WHERE a.MP_DATE =:schDate
			ORDER by a.ID_SITELINE
		) e ON e.LINE_NAME = d.LINE_NAME
		-- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
		LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID 
		LEFT JOIN mp_daily_detail m ON m.SCHD_ID = a.SCHD_ID 
		LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID 
		WHERE a.SCHD_PROD_DATE =:schDate  AND e.MP_DATE =:schDate  
	)n 
) nm
ORDER BY nm.SITE_NAME, nm.LINE_NAME, nm.SCHD_ID`;

//for sewing scan in list size
export const QryListSizeSewIn = `SELECT a.SCH_ID, a.SCHD_ID, b.PDM_ID, b.SIZE_CODE
FROM weekly_prod_sch_detail a
LEFT JOIN  view_weekly_sch_size b  ON b.SCH_ID = a.SCH_ID
-- LEFT JOIN po_matrix_delivery c ON c.PDM_ID = b.PDM_ID
WHERE a.SCHD_PROD_DATE = :schDate AND a.SCHD_SITE = :sitename`;

export const FindQrReturn = `SELECT * FROM scan_sewing_return a WHERE a.BARCODE_SERIAL = :barcodeserial AND  a.CONFIRM_STATUS = '0'`;
export const FindOnePlanZ = `SELECT * FROM qc_endline_plansize a WHERE a.PLANSIZE_ID = :planzId`;

export const SmvDailyPlan = db.define(
  "smv_daily_plan",
  {
    SCHD_ID: { type: DataTypes.BIGINT },
    SHIFT: { type: DataTypes.STRING },
    LINE_NAME: { type: DataTypes.STRING },
    SMV_PLAN: { type: DataTypes.FLOAT },
    CREATE_BY: { type: DataTypes.INTEGER },
    CREATE_DATE: { type: DataTypes.DATE },
    UPDATE_BY: { type: DataTypes.INTEGER },
    UPDATE_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CREATE_DATE",
    updatedAt: "UPDATE_DATE",
  }
);

SmvDailyPlan.removeAttribute("id");
