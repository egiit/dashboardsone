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
	LEFT JOIN mp_daily_detail m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift
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

export const QueryCheckSchdScan = `	SELECT * FROM (
	SELECT a.SCHD_ID, a.SCH_ID, f.PDM_ID, a.SCHD_PROD_DATE,
	b.ORDER_NO, b.MO_NO, d.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME,
	b.CUSTOMER_NAME, b.PRODUCT_ITEM_CODE, b.ORDER_REFERENCE_PO_NO, b.ITEM_COLOR_CODE, b.ITEM_COLOR_NAME, 
	b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, f.SIZE_CODE, f.SCH_SIZE_QTY, b.PRODUCTION_MONTH, 
	if(b.NEW_PLAN_EXFACTORY_DATE, b.NEW_PLAN_EXFACTORY_DATE, b.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE
	FROM weekly_prod_sch_detail a
	LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY
	LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
	LEFT JOIN view_weekly_sch_size f ON a.SCH_ID = f.SCH_ID
	-- LEFT JOIN po_matrix_delivery g ON f.PDM_ID = g.PDM_ID 
	WHERE a.SCHD_PROD_DATE = :plannDate
	AND a.SCHD_SITE = :sitename
	AND d.LINE_NAME = :lineName
	AND b.ORDER_NO = :orderNo  
	AND b.ORDER_STYLE_DESCRIPTION = :styleDesc
	AND b.ITEM_COLOR_NAME = :colorCode
	AND b.ORDER_REFERENCE_PO_NO = :orderRef 
	AND f.SIZE_CODE = :sizeCode 
	AND b.PRODUCTION_MONTH = :prodMonth 
) N WHERE N.PLAN_EXFACTORY_DATE = :planExFty AND N.SCH_SIZE_QTY <> 0`;
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
N.ORDER_COLOR, N.ORDER_SIZE, N.ORDER_QTY, N.ORDER_STYLE, N.BARCODE_SERIAL, N.SITE_LINE_FX, b.SITE_NAME, b.LINE_NAME,
N.PRODUCTION_MONTH, N.PLAN_EXFACTORY_DATE
FROM  (
	SELECT DISTINCT a.BARCODE_SERIAL, b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, c.ORDER_REFERENCE_PO_NO ORDER_REF,
	c.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_SIZE, b.ORDER_QTY, c.ORDER_STYLE_DESCRIPTION ORDER_STYLE, b.SITE_LINE SITE_LINE_FX, 
   	SUBSTRING_INDEX(b.SITE_LINE,' ',1) SITE, SUBSTRING_INDEX(b.SITE_LINE,' ',-1)  LINE,
   	c.PRODUCTION_MONTH, IF(c.NEW_PLAN_EXFACTORY_DATE,c.NEW_PLAN_EXFACTORY_DATE,c.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE
	FROM order_qr_generate a
	LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
	LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1) AND SUBSTRING_INDEX(b.BUYER_PO,',',-1)= c.ORDER_PO_ID
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
	LEFT JOIN (
			SELECT 
			    a.ENDLINE_ACT_SCHD_ID, 
			    a.ENDLINE_SCHD_DATE,  
			    a.ENDLINE_SCH_ID, 
			    a.ENDLINE_ID_SITELINE, 
			    a.ENDLINE_LINE_NAME,
			    SUM(CASE 
			        WHEN a.ENDLINE_PORD_TYPE = 'N' AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY
			        WHEN a.ENDLINE_PORD_TYPE = 'N' AND a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL THEN a.ENDLINE_OUT_QTY
			        WHEN a.ENDLINE_PORD_TYPE = 'O' AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY
			        WHEN a.ENDLINE_PORD_TYPE = 'O' AND a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL THEN a.ENDLINE_OUT_QTY
			        WHEN a.ENDLINE_PORD_TYPE = 'XO' AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY
			        WHEN a.ENDLINE_PORD_TYPE = 'XO' AND a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL THEN a.ENDLINE_OUT_QTY
			        ELSE 0
			    END) AS NORMAL_OUTPUT,
			    SUM(CASE 
			        WHEN a.ENDLINE_PORD_TYPE = 'N' AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'N' AND a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'O' AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'O' AND a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'XO' AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'XO' AND a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL THEN 0
			        ELSE a.ENDLINE_OUT_QTY
			    END) AS OT_OUTPUT,
			    SUM(CASE 
			        WHEN a.ENDLINE_PORD_TYPE = 'N' AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'N' AND a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'O' AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'O' AND a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'XO' AND a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN 0
			        WHEN a.ENDLINE_PORD_TYPE = 'XO' AND a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL THEN 0
			        ELSE a.ENDLINE_OUT_QTY
			    END) AS X_OT_OUTPUT
			FROM qc_endline_output a
			WHERE 
			    (a.ENDLINE_SCHD_DATE = :plannDate) AND 
			    (a.ENDLINE_ID_SITELINE = :idstieline) AND 
			    (a.ENDLINE_PORD_TYPE IN ('N', 'O', 'XO')) AND
			    ((a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL) OR 
			    (a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL))
			GROUP BY  
			    a.ENDLINE_ACT_SCHD_ID
	) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID AND p.ENDLINE_ID_SITELINE = :idstieline
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
	WHERE a.ENDLINE_VER IS NULL AND a.SCHD_PROD_DATE = :plannDate   AND e.MP_DATE = :plannDate  AND d.SITE_NAME = :sitename AND d.LINE_NAME = :linename
)n`;
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

//for sewing scan in storage size
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
    SMV_DAY_ID: { type: DataTypes.BIGINT, primaryKey: true },
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

export const LogDailyOutput = db.define(
  "log_daily_output",
  {
    LOG_ID: { type: DataTypes.BIGINT },
    SCHD_ID: { type: DataTypes.INTEGER },
    SCH_ID: { type: DataTypes.INTEGER },
    SCHD_PROD_DATE: { type: DataTypes.DATEONLY },
    ID_SITELINE: { type: DataTypes.STRING },
    SITE_NAME: { type: DataTypes.STRING },
    LINE_NAME: { type: DataTypes.STRING },
    SHIFT: { type: DataTypes.STRING },
    ORDER_NO: { type: DataTypes.STRING },
    SCHD_DAYS_NUMBER: { type: DataTypes.NUMBER },
    CUSTOMER_NAME: { type: DataTypes.STRING },
    ORDER_REFERENCE_PO_NO: { type: DataTypes.STRING },
    PRODUCT_ITEM_CODE: { type: DataTypes.STRING },
    ORDER_STYLE_DESCRIPTION: { type: DataTypes.STRING },
    ITEM_COLOR_CODE: { type: DataTypes.STRING },
    ITEM_COLOR_NAME: { type: DataTypes.STRING },
    PRODUCTION_MONTH: { type: DataTypes.STRING },
    SCHD_QTY: { type: DataTypes.INTEGER },
    PLAN_SEW_SMV: { type: DataTypes.DOUBLE },
    FT_NORMAL: { type: DataTypes.TIME },
    LT_NORMAL: { type: DataTypes.TIME },
    FT_OT: { type: DataTypes.TIME },
    LT_OT: { type: DataTypes.TIME },
    FT_X_OT: { type: DataTypes.TIME },
    LT_X_OT: { type: DataTypes.TIME },
    PLAN_MP: { type: DataTypes.INTEGER },
    PLAN_WH: { type: DataTypes.INTEGER },
    ACT_MP: { type: DataTypes.INTEGER },
    PLAN_TARGET: { type: DataTypes.DOUBLE },
    ACT_TARGET: { type: DataTypes.DOUBLE },
    PLAN_MP_OT: { type: DataTypes.INTEGER },
    PLAN_WH_OT: { type: DataTypes.INTEGER },
    ACT_MP_OT: { type: DataTypes.INTEGER },
    PLAN_TARGET_OT: { type: DataTypes.DOUBLE },
    ACT_TARGET_OT: { type: DataTypes.DOUBLE },
    PLAN_WH_X_OT: { type: DataTypes.INTEGER },
    ACT_MP_X_OT: { type: DataTypes.INTEGER },
    ACT_TARGET_X_OT: { type: DataTypes.DOUBLE },
    TOTAL_TARGET: { type: DataTypes.DOUBLE },
    NORMAL_OUTPUT: { type: DataTypes.INTEGER },
    OT_OUTPUT: { type: DataTypes.INTEGER },
    X_OT_OUTPUT: { type: DataTypes.INTEGER },
    TOTAL_OUTPUT: { type: DataTypes.INTEGER },
    PLAN_EH: { type: DataTypes.DOUBLE },
    PLAN_AH: { type: DataTypes.DOUBLE },
    PLAN_EH_OT: { type: DataTypes.DOUBLE },
    PLAN_AH_OT: { type: DataTypes.DOUBLE },
    PLAN_EH_X_OT: { type: DataTypes.DOUBLE },
    PLAN_AH_X_OT: { type: DataTypes.DOUBLE },
    ACT_WH: { type: DataTypes.INTEGER },
    ACT_WH_OT: { type: DataTypes.INTEGER },
    ACT_WH_X_OT: { type: DataTypes.INTEGER },
    ACTUAL_EH: { type: DataTypes.DOUBLE },
    ACTUAL_AH: { type: DataTypes.INTEGER },
    ACTUAL_EH_OT: { type: DataTypes.DOUBLE },
    ACTUAL_AH_OT: { type: DataTypes.DOUBLE },
    ACTUAL_EH_X_OT: { type: DataTypes.DOUBLE },
    ACTUAL_AH_X_OT: { type: DataTypes.DOUBLE },
    TOTAL_EH: { type: DataTypes.DOUBLE },
    TOTAL_AH: { type: DataTypes.DOUBLE },
    EFF_NORMAL: { type: DataTypes.DOUBLE },
    EFF_OT: { type: DataTypes.DOUBLE },
    EFF_X_OT: { type: DataTypes.DOUBLE },
    LOG_TIMESTAMP: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "LOG_TIMESTAMP",
    updatedAt: false,
  }
);

LogDailyOutput.removeAttribute("id");

export const QryDailyResultForSyncLog = `SELECT	
I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.SCHD_DAYS_NUMBER,
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE, 
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION,
I.PLAN_SEW_SMV, 
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
I.NORMAL_OUTPUT,  I.OT_OUTPUT, I.X_OT_OUTPUT, I.TOTAL_OUTPUT,  
I.PLAN_EH, I.PLAN_AH, I.PLAN_EH_OT, I.PLAN_AH_OT,  I.PLAN_EH_X_OT, I.PLAN_AH_X_OT,
I.ACT_WH, I.ACT_WH_OT, I.ACT_WH_X_OT, I.ACTUAL_EH, I.ACTUAL_AH, 
I.ACTUAL_EH_OT, I.ACTUAL_AH_OT, 
I.ACTUAL_EH_X_OT, I.ACTUAL_AH_X_OT,
IFNULL(I.ACTUAL_EH,0)+IFNULL(I.ACTUAL_EH_OT,0)+IFNULL(I.ACTUAL_EH_X_OT,0) AS TOTAL_EH,
IFNULL(I.ACTUAL_AH,0)+IFNULL(I.ACTUAL_AH_OT,0)+IFNULL(I.ACTUAL_AH_X_OT,0) AS TOTAL_AH,
ROUND(NULLIF(I.ACTUAL_EH/I.ACTUAL_AH,0)*100,2) EFF_NORMAL,
ROUND(NULLIF(I.ACTUAL_EH_OT/I.ACTUAL_AH_OT,0)*100,2) EFF_OT,
ROUND(NULLIF(I.ACTUAL_EH_X_OT/I.ACTUAL_AH_X_OT,0)*100,2) EFF_X_OT
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER,
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM , h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION,
        h.PLAN_SEW_SMV, -- h.FT_NORMAL,  h.LT_NORMAL, h.FT_OT, h.LT_OT,  h.FT_X_OT, h.LT_X_OT,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        h.ACT_TARGET, -- normal planning
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT,  h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        h.NORMAL_OUTPUT,  h.OT_OUTPUT, h.X_OT_OUTPUT,
        IFNULL(h.NORMAL_OUTPUT,0)+IFNULL(h.OT_OUTPUT,0)+IFNULL(X_OT_OUTPUT,0) TOTAL_OUTPUT,  -- actual ouput
        (h.ACT_TARGET*h.PLAN_SEW_SMV) PLAN_EH, (h.ACT_MP*h.PLAN_WH) PLAN_AH, -- plan EH and AH Actual target Normal
        (h.ACT_TARGET_OT*h.PLAN_SEW_SMV) PLAN_EH_OT, (h.ACT_MP_OT*h.PLAN_WH_OT) PLAN_AH_OT, -- plan EH and AH Actual target OT
        (h.ACT_TARGET_X_OT*h.PLAN_SEW_SMV) PLAN_EH_X_OT, (h.ACT_MP_X_OT*h.PLAN_WH_X_OT) PLAN_AH_X_OT, 
       	h.ACT_WH, h.ACT_WH_OT, h.ACT_WH_X_OT,
        (h.NORMAL_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH, (h.ACT_MP*h.ACT_WH) ACTUAL_AH,
        (h.OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_OT, (h.ACT_MP_OT*h.ACT_WH_OT) ACTUAL_AH_OT,
        (h.X_OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_X_OT, (h.ACT_MP_X_OT*h.ACT_WH_X_OT)  ACTUAL_AH_X_OT
        FROM(
 			   SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
		       n.ORDER_REFERENCE_PO_NO, n.SCHD_DAYS_NUMBER,
		       n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE, 
		       n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,
		       n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
		       n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
		       n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT, 
		       n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
		       n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
		       n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
		       n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
		       n.NORMAL_OUTPUT, n.OT_OUTPUT, n.X_OT_OUTPUT,
				 n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP, 
		       (n.PLAN_WH*n.ACT_MIN)/n.MAIN_WH ACT_WH, -- NEW FORMULA 
		       (n.PLAN_WH_OT*n.ACT_MIN_OT)/n.MAIN_WH_OT ACT_WH_OT,
		       (n.PLAN_WH_X_OT*n.ACT_MIN_XOT)/n.MAIN_WH_X_OT ACT_WH_X_OT
		   FROM (
		           SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT, 
		       IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
		       b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
		       b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
		       b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,  
		       FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
		       ACTUAL_MINUTE(:shift, a.SCHD_PROD_DATE, k.SHIFT_START_HOUR, k.SHIFT_END_HOUR, CURTIME(), e.PLAN_WH) ACT_MIN,
		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_END_HOUR, e.TTL_WH_OT, CURTIME(), f.PLAN_WH_OT) ACT_MIN_OT,
		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_HOURLY_OT2, e.TTL_WH_X_OT, CURTIME(), f.PLAN_WH_X_OT) ACT_MIN_XOT,
		       e.PLAN_WH MAIN_WH,
		       e.TTL_WH_OT MAIN_WH_OT,
		       e.TTL_WH_X_OT MAIN_WH_X_OT,
		       CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP,
       		 CASE WHEN ISNULL(f.PLAN_WH)  THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH,  
		       m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP, 
		       FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
		       FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
		       p.NORMAL_OUTPUT, p.OT_OUTPUT, p.X_OT_OUTPUT
		           FROM weekly_prod_sch_detail a
		           LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
		           LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
		           --	untuk aktual SMV
		           LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
		           LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
		           LEFT JOIN 	(
		                   -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
		                   SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_MP,  a.PLAN_WH,
								 		 SUM(d.PLAN_WH_OT) TTL_WH_OT, SUM(d.PLAN_WH_X_OT) TTL_WH_X_OT
								 FROM manpower_detail a 
								 LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
								 LEFT JOIN  weekly_prod_sch_detail c on c.SCHD_ID_SITELINE = b.ID_SITELINE 
								 LEFT JOIN workinghour_detail d ON d.SCHD_ID = c.SCHD_ID
								 WHERE a.MP_DATE = :schDate   AND b.SHIFT = :shift AND b.SITE_NAME = :sitename
								 AND c.SCHD_PROD_DATE = :schDate
								 GROUP BY a.ID_SITELINE, b.SHIFT
								 ORDER by a.ID_SITELINE
		           ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
		           -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
		           LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
		           LEFT JOIN mp_daily_detail m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift 
		           -- left join ciew qcendlineoutput untuk mendapatkan output
		           LEFT JOIN (
					  				SELECT N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_SCHD_DATE,  N.ENDLINE_SCH_ID, N.ENDLINE_ID_SITELINE, N.ENDLINE_LINE_NAME,
									SUM(N.ENDLINE_OUT_QTY) NORMAL_OUTPUT,
									SUM(N.ENDLINE_OUT_QTY_OT) OT_OUTPUT,
									SUM(N.ENDLINE_OUT_QTY_X_OT) X_OT_OUTPUT
									FROM(
									-- normal 
										SELECT  
										a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
										a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
										FROM qc_endline_output a 
										LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
										WHERE a.ENDLINE_SCHD_DATE = :schDate  AND b.SHIFT = :shift AND 
										 a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'N'
										-- RTT n Repair
										UNION ALL
										SELECT 
											a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
											a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
										FROM qc_endline_output a 
										LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
										WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate  AND b.SHIFT = :shift AND 
										a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL   AND a.ENDLINE_PORD_TYPE = 'N'
										UNION ALL
									-- OT
										SELECT
											a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
											0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
										FROM qc_endline_output a 
										LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
										WHERE a.ENDLINE_SCHD_DATE = :schDate  AND b.SHIFT = :shift AND 
										a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'O'
										UNION ALL
										SELECT 
										a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME,date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
										0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
										FROM qc_endline_output a 
										LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
										WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate  AND b.SHIFT = :shift AND  
										a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'O'
										UNION ALL 
									-- extra ot
										SELECT
											a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
											0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT
										FROM qc_endline_output a 
										LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
										WHERE a.ENDLINE_SCHD_DATE = :schDate  AND b.SHIFT = :shift AND 
										a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'XO'
										UNION ALL
										SELECT 
										a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
										0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT
										FROM qc_endline_output a  
										LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
										WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate  AND b.SHIFT = :shift AND 
										a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'XO'
									) N
									GROUP BY  N.ENDLINE_ACT_SCHD_ID
		           ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
		           LEFT JOIN item_working_shift k ON k.SHIFT_ID  = :shift AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate )) > 1 
		           WHERE a.SCHD_PROD_DATE = :schDate   AND  e.SHIFT = :shift AND d.SITE_NAME = :sitename AND d.SHIFT = :shift
            )n
        )h
    ) I`;
