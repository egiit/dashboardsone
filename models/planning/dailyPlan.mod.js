export const QueryDailyPlann = `SELECT *, n.PLAN_MP*n.PLAN_WH*60/n.PLAN_SEW_SMV PLAN_TARGET,
n.PLAN_MP_OT*n.PLAN_WH_OT*60/n.PLAN_SEW_SMV PLAN_TARGET_OT
 FROM (
	SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT,
	b.ORDER_REFERENCE_PO_NO, d.FOREMAN, 
	a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, a.SCHD_QTY, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
	b.ITEM_COLOR_CODE, b.PRODUCT_ITEM_DESCRIPTION,  
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
		WHERE a.MP_DATE = :plannDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift
		ORDER by a.ID_SITELINE
	) e ON e.LINE_NAME = d.LINE_NAME
	-- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
	LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
	LEFT JOIN mp_daily_detail m ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift
	LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift
	WHERE a.SCHD_PROD_DATE = :plannDate  AND e.MP_DATE = :plannDate AND d.SITE_NAME = :sitename 
)n `;

// export const QueryDailyPlann = `SELECT *, n.PLAN_MP*n.PLAN_WH*60/n.PLAN_SEW_SMV PLAN_TARGET,
// n.PLAN_MP_OT*n.PLAN_WH_OT*60/n.PLAN_SEW_SMV PLAN_TARGET_OT
//  FROM (
// 	SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.SCHD_ID_SITELINE, d.SITE_NAME, b.ORDER_REFERENCE_PO_NO, d.FOREMAN, d.LINE_NAME,
// 	a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, a.SCHD_QTY, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE,
// 	b.ITEM_COLOR_CODE, b.PRODUCT_ITEM_DESCRIPTION, c.PLAN_SEW_SMV,
// 	CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP,
// 	CASE WHEN ISNULL(f.PLAN_WH) THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH,
// 	m.PLAN_MP_OT, f.PLAN_WH_OT
// 	FROM weekly_prod_sch_detail a
// 	LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY
// 	LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
// 	LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
// 	LEFT JOIN manpower_detail e ON e.ID_SITELINE = d.ID_SITELINE
// 	LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID
// 	LEFT JOIN mp_daily_detail m ON m.SCHD_ID = a.SCHD_ID
//     WHERE a.SCHD_PROD_DATE = :plannDate  AND e.MP_DATE = :plannDate AND d.SITE_NAME = :sitename
// )n `;
