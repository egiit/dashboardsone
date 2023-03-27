export const QuerySewOutDayRep = `SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.LINE_NAME, h.SHIFT,	h.ORDER_REFERENCE_PO_NO, 
h.SCHD_DAYS_NUMBER, h.SCHD_QTY, h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_DIVISION, h.PRODUCT_ITEM_CODE, 
h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.PRODUCT_ITEM_DESCRIPTION, h.PLAN_SEW_SMV, h.PLAN_MP, h.PLAN_WH, h.SIZE,
--	h.PLAN_TARGET_OT, h.PLAN_TARGET,
IF(h.PLAN_TARGET_OT, h.PLAN_TARGET+h.PLAN_TARGET_OT, h.PLAN_TARGET) TOTAL_TARGET, 
--	h.NORMAL_OUTPUT,  h.OT_OUTPUT,
IF(h.OT_OUTPUT, h.OT_OUTPUT+h.NORMAL_OUTPUT, h.NORMAL_OUTPUT)  TOTAL_OUTPUT
FROM(
SELECT 
n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT,	n.ORDER_REFERENCE_PO_NO, 
n.SCHD_DAYS_NUMBER, n.SCHD_QTY, n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_DIVISION, n.PRODUCT_ITEM_CODE, 
n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.PRODUCT_ITEM_DESCRIPTION, n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.SIZE,
ROUND(n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV) PLAN_TARGET,
ROUND(n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV) PLAN_TARGET_OT,
 xc.NORMAL_OUTPUT, xc.OT_OUTPUT
 FROM (
SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT,
b.ORDER_REFERENCE_PO_NO, d.FOREMAN, 
a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, a.SCHD_QTY, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_DIVISION, b.PRODUCT_ITEM_CODE, 
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.PRODUCT_ITEM_DESCRIPTION,  r.SCH_QTY, b.MO_QTY, IF(r.SCH_QTY = b.MO_QTY , 'ALL' ,'PARTIAL') SIZE,
CASE WHEN ISNULL(c.ACTUAL_SEW_SMV) THEN c.PLAN_SEW_SMV ELSE c.ACTUAL_SEW_SMV END PLAN_SEW_SMV,
CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP, 
CASE WHEN ISNULL(f.PLAN_WH) THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH, 
m.PLAN_MP_OT, f.PLAN_WH_OT -- , o.PLAN_REMARK
FROM weekly_prod_sch_detail a
LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
LEFT JOIN weekly_prod_schedule r ON a.SCH_ID = r.SCH_ID
LEFT JOIN 	(
-- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
    SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_WH, a.PLAN_MP, a.ACT_WH, a.ACT_MP, a.OT_WH, a.OT_MP
    FROM manpower_detail a 
    LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
    WHERE a.MP_DATE = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift
    ORDER by a.ID_SITELINE
) e ON e.LINE_NAME = d.LINE_NAME
-- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
LEFT JOIN mp_daily_detail m ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift
-- LEFT JOIN qc_endline_remark o ON o.SCHD_ID = a.SCHD_ID 
WHERE a.SCHD_PROD_DATE = :schDate  AND e.MP_DATE = :schDate AND d.SITE_NAME = :sitename 
)n LEFT JOIN qcendlineoutput xc ON xc.ENDLINE_ACT_SCHD_ID = n.SCHD_ID AND xc.ENDLINE_ID_SITELINE = n.ID_SITELINE
group by n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT,	n.ORDER_REFERENCE_PO_NO, 
n.SCHD_DAYS_NUMBER, n.SCHD_QTY, n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_DIVISION, n.PRODUCT_ITEM_CODE, 
n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.PRODUCT_ITEM_DESCRIPTION, n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH
ORDER BY n.ID_SITELINE
)h`;

export const getSewOutDayRepSize = `SELECT a.SCHD_PROD_DATE, b.ENDLINE_ID_SITELINE, b.ENDLINE_ACT_SCHD_ID, b.ENDLINE_PLAN_SIZE, 
SUM(b.CHECKED) CHECKED, SUM(b.GOOD) GOOD, SUM(b.RTT) RTT, SUM(b.DEFECT) DEFECT, SUM(b.REPAIRED) REPAIRED, SUM(b.BS) BS
FROM weekly_prod_sch_detail a
LEFT JOIN viewqcendcheckall b ON a.SCHD_ID = b.ENDLINE_ACT_SCHD_ID 
LEFT JOIN item_siteline c ON a.SCHD_ID_SITELINE = c.ID_SITELINE
WHERE a.SCHD_PROD_DATE = :schDate AND  c.SITE_NAME = :sitename AND c.SHIFT = :shift
GROUP BY a.SCHD_PROD_DATE, b.ENDLINE_ID_SITELINE, b.ENDLINE_ACT_SCHD_ID,  b.ENDLINE_PLAN_SIZE`;

export const QrySewDayOutByPo = `SELECT h.CUSTOMER_NAME, h.CUSTOMER_DIVISION, h.ORDER_REFERENCE_PO_NO, h.ORDER_NO, h.PRODUCT_ITEM_CODE, 
h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.PRODUCT_ITEM_DESCRIPTION, h.MO_NO,
SUM(h.SCHD_QTY)  SCHD_QTY, 
IF(h.PLAN_TARGET_OT, SUM(h.PLAN_TARGET)+SUM(h.PLAN_TARGET_OT),SUM(h.PLAN_TARGET))  TOTAL_TARGET, 
IF(h.OT_OUTPUT, SUM(h.NORMAL_OUTPUT)+SUM(h.OT_OUTPUT), SUM(h.NORMAL_OUTPUT)) TOTAL_OUTPUT
FROM(
	SELECT 
	n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT,	n.ORDER_REFERENCE_PO_NO, 
	n.SCHD_DAYS_NUMBER, n.SCHD_QTY, n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_DIVISION, n.PRODUCT_ITEM_CODE, 
	n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.PRODUCT_ITEM_DESCRIPTION, n.MO_NO, n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.SIZE,
	ROUND(n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV) PLAN_TARGET,
	ROUND(n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV) PLAN_TARGET_OT,
	 xc.NORMAL_OUTPUT, xc.OT_OUTPUT
	 FROM (
		SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT,
		b.ORDER_REFERENCE_PO_NO, d.FOREMAN, 
		a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, a.SCHD_QTY, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_DIVISION, b.PRODUCT_ITEM_CODE, 
		b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.PRODUCT_ITEM_DESCRIPTION, b.MO_NO,  r.SCH_QTY, b.MO_QTY, IF(r.SCH_QTY = b.MO_QTY , 'ALL' ,'PARTIAL') SIZE,
		CASE WHEN ISNULL(c.ACTUAL_SEW_SMV) THEN c.PLAN_SEW_SMV ELSE c.ACTUAL_SEW_SMV END PLAN_SEW_SMV,
		CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP, 
		CASE WHEN ISNULL(f.PLAN_WH) THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH, 
		m.PLAN_MP_OT, f.PLAN_WH_OT -- , o.PLAN_REMARK
		FROM weekly_prod_sch_detail a
		LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
		LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
		LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
		LEFT JOIN weekly_prod_schedule r ON a.SCH_ID = r.SCH_ID
		LEFT JOIN 	(
		-- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
		    SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_WH, a.PLAN_MP
		    FROM manpower_detail a 
		    LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
		    WHERE a.MP_DATE = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift
		    ORDER BY a.ID_SITELINE
		) e ON e.LINE_NAME = d.LINE_NAME
		-- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
		LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
		LEFT JOIN mp_daily_detail m ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift
		-- LEFT JOIN qc_endline_remark o ON o.SCHD_ID = a.SCHD_ID 
		WHERE a.SCHD_PROD_DATE = :schDate  AND e.MP_DATE = :schDate AND d.SITE_NAME = :sitename 
	)n 
	LEFT JOIN qcendlineoutput xc ON xc.ENDLINE_ACT_SCHD_ID = n.SCHD_ID AND xc.ENDLINE_ID_SITELINE = n.ID_SITELINE
	group by n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT,	n.ORDER_REFERENCE_PO_NO, 
	n.SCHD_DAYS_NUMBER, n.SCHD_QTY, n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_DIVISION, n.PRODUCT_ITEM_CODE, 
	n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.PRODUCT_ITEM_DESCRIPTION, n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH
	ORDER BY n.ID_SITELINE
)h
GROUP BY h.CUSTOMER_NAME, h.CUSTOMER_DIVISION, h.ORDER_REFERENCE_PO_NO, h.ORDER_NO, h.PRODUCT_ITEM_CODE, 
h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.PRODUCT_ITEM_DESCRIPTION`;

export const QrySewDaySizeByPO = `SELECT 
e.CUSTOMER_NAME, e.CUSTOMER_DIVISION, e.ORDER_REFERENCE_PO_NO, e.ORDER_NO, e.PRODUCT_ITEM_CODE, 
e.ITEM_COLOR_CODE, e.MO_NO, a.ENDLINE_PLAN_SIZE, 
SUM(a.GOOD) GOOD
FROM viewqcendcheckall a
LEFT JOIN  weekly_prod_sch_detail b ON  a.ENDLINE_SCHD_DATE = :schDate AND  b.SCHD_ID = a.ENDLINE_ACT_SCHD_ID 
LEFT JOIN  viewcapacity e ON e.ID_CAPACITY = b.SCHD_CAPACITY_ID 
LEFT JOIN item_siteline c ON b.SCHD_ID_SITELINE = c.ID_SITELINE
WHERE a.ENDLINE_SCHD_DATE = :schDate AND  c.SITE_NAME = :sitename AND c.SHIFT = :shift
GROUP BY e.CUSTOMER_NAME, e.CUSTOMER_DIVISION, e.ORDER_REFERENCE_PO_NO, e.ORDER_NO, e.PRODUCT_ITEM_CODE, 
e.ITEM_COLOR_CODE,  e.MO_NO, a.ENDLINE_PLAN_SIZE`;
