export const QurTablPlanQcEndRep = `SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.LINE_NAME, h.SHIFT,	h.ORDER_REFERENCE_PO_NO, 
h.SCHD_DAYS_NUMBER, h.SCHD_QTY, h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_DIVISION, h.PRODUCT_ITEM_CODE, 
h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.PRODUCT_ITEM_DESCRIPTION, h.PLAN_SEW_SMV, h.PLAN_MP, h.PLAN_WH, 
h.PLAN_TARGET_OT, h.PLAN_TARGET, ROUND(h.TOTAL_TARGET) TOTAL_TARGET, 
h.NORMAL_OUTPUT,  h.OT_OUTPUT, h.X_OT_OUTPUT,
h.TOTAL_OUTPUT, h.CHECKED, h.RTT, h.DEFECT, h.REPAIRED, h.BS 
FROM(
	SELECT 
	n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT,	n.ORDER_REFERENCE_PO_NO, 
	n.SCHD_DAYS_NUMBER, n.SCHD_QTY, n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_DIVISION, n.PRODUCT_ITEM_CODE, 
	n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.PRODUCT_ITEM_DESCRIPTION, n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH,
	xc.ACT_TARGET PLAN_TARGET, xc.ACT_TARGET PLAN_TARGET_OT, xc.ACT_TARGET_X_OT PLAN_TARGET_X_OT, IFNULL(xc.TOTAL_TARGET,0) TOTAL_TARGET,
	xc.NORMAL_OUTPUT, xc.OT_OUTPUT, xc.X_OT_OUTPUT, xc.TOTAL_OUTPUT, xs.CHECKED, xs.RTT, xs.DEFECT, xs.REPAIRED, xs.BS -- , n.PLAN_REMARK
	FROM (
	    SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT,
	    b.ORDER_REFERENCE_PO_NO, d.FOREMAN, 
	    a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, a.SCHD_QTY, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_DIVISION, b.PRODUCT_ITEM_CODE, 
	    b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.PRODUCT_ITEM_DESCRIPTION,  
	    CASE WHEN ISNULL(c.ACTUAL_SEW_SMV) THEN c.PLAN_SEW_SMV ELSE c.ACTUAL_SEW_SMV END PLAN_SEW_SMV,
	    CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP, 
	    CASE WHEN ISNULL(f.PLAN_WH) THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH, 
	    m.PLAN_MP_OT, f.PLAN_WH_OT -- , o.PLAN_REMARK
	FROM weekly_prod_sch_detail a
	LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
	LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
	LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
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
	)n LEFT JOIN log_daily_output xc ON xc.SCHD_ID = n.SCHD_ID AND xc.ID_SITELINE = n.ID_SITELINE
	LEFT JOIN (
		     SELECT
			    c.ENDLINE_SCHD_DATE,
			    c.ENDLINE_ID_SITELINE,
			    c.ENDLINE_ACT_SCHD_ID,
			    SUM(c.RFT) AS RTT,
			    SUM(c.DEFECT) AS DEFECT,
			    SUM(c.REPAIRED) AS REPAIRED,
			    SUM(c.BS) AS BS,
			    SUM(c.RFT) + SUM(c.DEFECT) + SUM(c.BS) AS CHECKED
			FROM (
			    SELECT
			        DATE(a.ENDLINE_SCHD_DATE) AS ENDLINE_SCHD_DATE,
			        a.ENDLINE_ID_SITELINE,
			        a.ENDLINE_ACT_SCHD_ID,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'RTT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS RFT,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS DEFECT,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'BS' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS BS,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND a.ENDLINE_REPAIR = 'Y' 
			            AND DATE(a.ENDLINE_MOD_TIME) = :schDate THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS REPAIRED
			    FROM qc_endline_output a
			    LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
			    WHERE DATE(a.ENDLINE_ADD_TIME) = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift
			    AND (a.ENDLINE_OUT_TYPE = 'RTT' OR (a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y') OR a.ENDLINE_OUT_TYPE = 'BS'
			    OR (a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y' AND DATE(a.ENDLINE_MOD_TIME) = :schDate))
			) c
			GROUP BY c.ENDLINE_SCHD_DATE, c.ENDLINE_ID_SITELINE, c.ENDLINE_ACT_SCHD_ID
	) xs ON xs.ENDLINE_ACT_SCHD_ID = n.SCHD_ID
	group by n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT,	n.ORDER_REFERENCE_PO_NO, 
	n.SCHD_DAYS_NUMBER, n.SCHD_QTY, n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_DIVISION, n.PRODUCT_ITEM_CODE, 
	n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.PRODUCT_ITEM_DESCRIPTION, n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH
	ORDER BY n.ID_SITELINE
)h`;

export const QueryDetailEndCheck = `SELECT a.SCHD_PROD_DATE, b.ENDLINE_ID_SITELINE, b.ENDLINE_ACT_SCHD_ID, b.HOUR_TIME, b.ENDLINE_TIME,
b.ENDLINE_PLAN_SIZE, b.CHECKED, b.GOOD, b.RTT, b.DEFECT, b.REPAIRED, b.BS
FROM weekly_prod_sch_detail a
LEFT JOIN (
	SELECT 
	n.ENDLINE_SCHD_DATE, n.ENDLINE_ID_SITELINE,  n.ENDLINE_ACT_SCHD_ID, 
	n.ENDLINE_TIME HOUR_TIME,
	SEC_TO_TIME(n.ENDLINE_TIME*3600) ENDLINE_TIME,
	n.ENDLINE_PLAN_SIZE,
	IFNULL(n.RTT,0) RTT,
	IFNULL(n.DEFECT, 0) AS DEFECT,
	IFNULL(n.REPAIRED, 0) AS REPAIRED,
	IFNULL(n.BS, 0) AS BS,
	IFNULL(n.RTT,0)+IFNULL(n.DEFECT,0)+IFNULL(n.BS,0) CHECKED,
	IFNULL(n.RTT, 0) + IFNULL(n.REPAIRED, 0) GOOD
 FROM (
		 SELECT
			 c.ENDLINE_SCHD_DATE,
			 c.ENDLINE_ID_SITELINE,
			 c.ENDLINE_ACT_SCHD_ID,
			 c.ENDLINE_TIME,
			 c.ENDLINE_PLAN_SIZE,
			 SUM(c.RFT) AS RTT,
			 SUM(c.DEFECT) AS DEFECT,
			 SUM(c.REPAIRED) AS REPAIRED,
			 SUM(c.BS) AS BS
		 FROM (
			 	SELECT
					DATE(a.ENDLINE_ADD_TIME) AS ENDLINE_SCHD_DATE,
					a.ENDLINE_ID_SITELINE,
					a.ENDLINE_ACT_SCHD_ID,
					a.ENDLINE_PLAN_SIZE,
					HOUR(a.ENDLINE_ADD_TIME) AS ENDLINE_TIME,
					CASE
					 WHEN a.ENDLINE_OUT_TYPE = 'RTT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
					 ELSE 0
					END AS RFT,
					CASE
					 WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
					 ELSE 0
					END AS DEFECT,
					CASE
					 WHEN a.ENDLINE_OUT_TYPE = 'BS' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
					 ELSE 0
					END AS BS,
					0 REPAIRED
					FROM qc_endline_output a
					WHERE DATE(a.ENDLINE_ADD_TIME) = :schDate AND  a.ENDLINE_ID_SITELINE = :idSiteLine AND a.ENDLINE_ACT_SCHD_ID = :schdId
					AND (a.ENDLINE_OUT_TYPE = 'RTT' OR a.ENDLINE_OUT_TYPE = 'DEFECT'  OR a.ENDLINE_OUT_TYPE = 'BS')
					UNION ALL
					SELECT
					DATE(a.ENDLINE_MOD_TIME) AS ENDLINE_SCHD_DATE,
					a.ENDLINE_ID_SITELINE,
					a.ENDLINE_ACT_RPR_SCHD_ID ENDLINE_ACT_SCHD_ID,
					a.ENDLINE_PLAN_SIZE,
					HOUR(a.ENDLINE_MOD_TIME) ENDLINE_TIME,
					0 RFT, 0 DEFECT, 0 BS,
					CASE
					   WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND a.ENDLINE_REPAIR = 'Y' 
					   AND DATE(a.ENDLINE_MOD_TIME) = :schDate THEN a.ENDLINE_OUT_QTY
					   ELSE 0
					END AS REPAIRED
					FROM qc_endline_output a
					WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND  a.ENDLINE_ID_SITELINE = :idSiteLine AND a.ENDLINE_ACT_RPR_SCHD_ID = :schdId
					AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y' 
		 ) c
		 GROUP BY c.ENDLINE_SCHD_DATE, c.ENDLINE_ID_SITELINE, c.ENDLINE_ACT_SCHD_ID, c.ENDLINE_TIME, c.ENDLINE_PLAN_SIZE
 )n
) b ON a.SCHD_ID = b.ENDLINE_ACT_SCHD_ID 
WHERE a.SCHD_PROD_DATE = :schDate AND b.ENDLINE_ID_SITELINE = :idSiteLine AND a.SCHD_ID = :schdId
ORDER BY b.HOUR_TIME`;
// export const QueryDetailEndCheck = `SELECT a.TYPE_PROD, a.ENDLINE_SCHD_DATE, a.ENDLINE_ID_SITELINE, a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_TIME, a.HOUR_TIME,
// a.ENDLINE_PLAN_SIZE, a.GOOD, a.CHECKED, a.RTT, a.DEFECT, a.REPAIRED, a.BS
// FROM qcendrepcheck a WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteLine AND a.ENDLINE_ACT_SCHD_ID = :schdId
// ORDER BY a.TYPE_PROD,  a.HOUR_TIME`;

export const QuerySumPartDefCodeCheck = `SELECT 
'DEF' TYP, N.ENDLINE_OUT_ID, DATE(N.ENDLINE_ADD_TIME), N.ENDLINE_SCHD_DATE, N.ENDLINE_SCHD_ID, N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE, 
 SUM(N.ENDLINE_OUT_QTY) ENDLINE_OUT_QTY, N.DEFECT_NAME, N.PART_NAME
FROM (
    SELECT a.ENDLINE_OUT_ID, DATE(a.ENDLINE_ADD_TIME) ENDLINE_ADD_TIME, a.ENDLINE_SCHD_DATE, a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE, HOUR(a.ENDLINE_ADD_TIME) ENDLINE_TIME, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE, 
             a.ENDLINE_OUT_QTY, b.DEFECT_NAME, c.PART_NAME
    FROM qc_endline_output a 
    LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE 
    LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
    WHERE   a.ENDLINE_ID_SITELINE = :idSiteLine  
    AND a.ENDLINE_ACT_SCHD_ID = :schdId AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL 
) N GROUP BY N.ENDLINE_SCHD_DATE, N.ENDLINE_SCHD_ID,  N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE
UNION ALL 
SELECT 
 'REPAIR' TYP, N.ENDLINE_OUT_ID, DATE(N.ENDLINE_MOD_TIME), N.ENDLINE_SCHD_DATE, N.ENDLINE_SCHD_ID, N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE, 
 SUM(N.ENDLINE_OUT_QTY) ENDLINE_OUT_QTY, N.DEFECT_NAME, N.PART_NAME
FROM (
    SELECT a.ENDLINE_OUT_ID, DATE(a.ENDLINE_MOD_TIME) ENDLINE_MOD_TIME, a.ENDLINE_SCHD_DATE, a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE, HOUR(a.ENDLINE_MOD_TIME) ENDLINE_TIME, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE, 
             a.ENDLINE_OUT_QTY, b.DEFECT_NAME, c.PART_NAME
    FROM qc_endline_output a 
    LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE 
    LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
    WHERE   a.ENDLINE_ID_SITELINE = :idSiteLine  
    AND a.ENDLINE_ACT_RPR_SCHD_ID = :schdId AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND  a.ENDLINE_REPAIR = 'Y'
    AND DATE(a.ENDLINE_MOD_TIME) = :schDate
) N GROUP BY N.ENDLINE_SCHD_DATE, N.ENDLINE_SCHD_ID,  N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE`;
// export const QuerySumPartDefCodeCheck = `SELECT
//     'DEF' TYP, N.ENDLINE_SCHD_DATE, N.ENDLINE_SCHD_ID, N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE,
//     SUM(N.ENDLINE_OUT_QTY) ENDLINE_OUT_QTY, N.DEFECT_NAME, N.PART_NAME
//     FROM (
//         SELECT a.ENDLINE_SCHD_DATE, a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE, HOUR(a.ENDLINE_ADD_TIME) ENDLINE_TIME, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE,
//                 a.ENDLINE_OUT_QTY, b.DEFECT_NAME, c.PART_NAME
//         FROM qc_endline_output a
//         LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE
//         LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
//         WHERE DATE(a.ENDLINE_ADD_TIME) =  :schDate AND a.ENDLINE_ID_SITELINE = :idSiteLine
//         AND a.ENDLINE_ACT_SCHD_ID = :schdId AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL
//     ) N GROUP BY N.ENDLINE_SCHD_DATE, N.ENDLINE_SCHD_ID,  N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE
// UNION ALL
//     SELECT
//     'REPAIR' TYP, N.ENDLINE_SCHD_DATE, N.ENDLINE_SCHD_ID, N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE,
//     SUM(N.ENDLINE_OUT_QTY) ENDLINE_OUT_QTY, N.DEFECT_NAME, N.PART_NAME
//     FROM (
//         SELECT a.ENDLINE_SCHD_DATE, a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE, HOUR(a.ENDLINE_MOD_TIME) ENDLINE_TIME, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE,
//                 a.ENDLINE_OUT_QTY, b.DEFECT_NAME, c.PART_NAME
//         FROM qc_endline_output a
//         LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE
//         LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
//         WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteLine
//         AND a.ENDLINE_ACT_RPR_SCHD_ID = :schdId AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND  a.ENDLINE_REPAIR = 'Y'
//     ) N GROUP BY N.ENDLINE_SCHD_DATE, N.ENDLINE_SCHD_ID,  N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE`;

export const QueryDtlEndChckTblet = `SELECT a.SCHD_PROD_DATE, b.ENDLINE_ID_SITELINE, b.ENDLINE_ACT_SCHD_ID, b.HOUR_TIME, b.ENDLINE_TIME,
b.ENDLINE_PLAN_SIZE, b.CHECKED, b.GOOD, b.RTT, b.DEFECT, b.REPAIRED, b.BS
FROM weekly_prod_sch_detail a
LEFT JOIN (
	SELECT 
	n.ENDLINE_SCHD_DATE, n.ENDLINE_ID_SITELINE,  n.ENDLINE_ACT_SCHD_ID, 
	n.ENDLINE_TIME HOUR_TIME,
	SEC_TO_TIME(n.ENDLINE_TIME*3600) ENDLINE_TIME,
	n.ENDLINE_PLAN_SIZE,
	IFNULL(n.RTT,0) RTT,
	IFNULL(n.DEFECT, 0) AS DEFECT,
	IFNULL(n.REPAIRED, 0) AS REPAIRED,
	IFNULL(n.BS, 0) AS BS,
	IFNULL(n.RTT,0)+IFNULL(n.DEFECT,0)+IFNULL(n.BS, 0) CHECKED,
	IFNULL(n.RTT, 0) + IFNULL(n.REPAIRED, 0) GOOD
 FROM (
		 SELECT
			 c.ENDLINE_SCHD_DATE,
			 c.ENDLINE_ID_SITELINE,
			 c.ENDLINE_ACT_SCHD_ID,
			 c.ENDLINE_TIME,
			 c.ENDLINE_PLAN_SIZE,
			 SUM(c.RFT) AS RTT,
			 SUM(c.DEFECT) AS DEFECT,
			 SUM(c.REPAIRED) AS REPAIRED,
			 SUM(c.BS) AS BS
		 FROM (
			 	SELECT
					DATE(a.ENDLINE_ADD_TIME) AS ENDLINE_SCHD_DATE,
					a.ENDLINE_ID_SITELINE,
					a.ENDLINE_ACT_SCHD_ID,
					a.ENDLINE_PLAN_SIZE,
					HOUR(a.ENDLINE_ADD_TIME) AS ENDLINE_TIME,
					CASE
					 WHEN a.ENDLINE_OUT_TYPE = 'RTT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
					 ELSE 0
					END AS RFT,
					CASE
					 WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
					 ELSE 0
					END AS DEFECT,
					CASE
					 WHEN a.ENDLINE_OUT_TYPE = 'BS' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
					 ELSE 0
					END AS BS,
					0 REPAIRED
					FROM qc_endline_output a
					WHERE DATE(a.ENDLINE_ADD_TIME) = :schDate AND  a.ENDLINE_ID_SITELINE = :idSiteLine
					AND (a.ENDLINE_OUT_TYPE = 'RTT' OR a.ENDLINE_OUT_TYPE = 'DEFECT'  OR a.ENDLINE_OUT_TYPE = 'BS')
					UNION ALL
					SELECT
					DATE(a.ENDLINE_MOD_TIME) AS ENDLINE_SCHD_DATE,
					a.ENDLINE_ID_SITELINE,
					a.ENDLINE_ACT_RPR_SCHD_ID ENDLINE_ACT_SCHD_ID,
					a.ENDLINE_PLAN_SIZE,
					HOUR(a.ENDLINE_MOD_TIME) ENDLINE_TIME,
					0 RFT, 0 DEFECT, 0 BS,
					CASE
					   WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND a.ENDLINE_REPAIR = 'Y' 
					   AND DATE(a.ENDLINE_MOD_TIME) = :schDate THEN a.ENDLINE_OUT_QTY
					   ELSE 0
					END AS REPAIRED
					FROM qc_endline_output a
					WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND  a.ENDLINE_ID_SITELINE = :idSiteLine 
					AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y' 
		 ) c
		 GROUP BY c.ENDLINE_SCHD_DATE, c.ENDLINE_ID_SITELINE, c.ENDLINE_ACT_SCHD_ID, c.ENDLINE_TIME, c.ENDLINE_PLAN_SIZE
 )n
) b ON a.SCHD_ID = b.ENDLINE_ACT_SCHD_ID 
WHERE a.SCHD_PROD_DATE = :schDate AND b.ENDLINE_ID_SITELINE = :idSiteLine
ORDER BY b.HOUR_TIME`;

export const QuerySumPartDefCodChk = `SELECT 
'DEF' TYP, N.ENDLINE_SCHD_DATE, N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE, 
 SUM(N.ENDLINE_OUT_QTY) ENDLINE_OUT_QTY, N.DEFECT_NAME, N.PART_NAME
FROM (
SELECT a.ENDLINE_SCHD_DATE, a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_PLAN_SIZE, HOUR(a.ENDLINE_ADD_TIME) ENDLINE_TIME, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE, 
         a.ENDLINE_OUT_QTY, b.DEFECT_NAME, c.PART_NAME
FROM qc_endline_output a 
LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE 
LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteLine 
AND  a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL 
) N GROUP BY N.ENDLINE_SCHD_DATE, N.ENDLINE_ACT_SCHD_ID,  N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE
UNION ALL 
SELECT 
 'REPAIR' TYP, N.ENDLINE_SCHD_DATE, N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE, 
 SUM(N.ENDLINE_OUT_QTY) ENDLINE_OUT_QTY, N.DEFECT_NAME, N.PART_NAME
FROM (
SELECT a.ENDLINE_SCHD_DATE, a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_PLAN_SIZE, HOUR(a.ENDLINE_MOD_TIME) ENDLINE_TIME, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE, 
         a.ENDLINE_OUT_QTY, b.DEFECT_NAME, c.PART_NAME
FROM qc_endline_output a 
LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE 
LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteLine 
AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND  a.ENDLINE_REPAIR = 'Y'
) N GROUP BY N.ENDLINE_SCHD_DATE, N.ENDLINE_ACT_SCHD_ID,  N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE`;

export const QueryDtlDayDef = `SELECT N.ENDLINE_SCHD_DATE, N.ENDLINE_ACT_SCHD_ID, N.SITE_NAME, N.LINE_NAME, N.SHIFT,
N.CUSTOMER_NAME, N.ORDER_REFERENCE_PO_NO, N.ORDER_STYLE_DESCRIPTION, N.ITEM_COLOR_NAME, N.PRODUCT_ITEM_CODE,
N.ENDLINE_TIME, SEC_TO_TIME(N.ENDLINE_TIME*3600) ENDLINE_TIME_FORMAT, N.ENDLINE_PLAN_SIZE,
N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE, M.CHECKED, M.GOOD,
SUM(N.ENDLINE_OUT_QTY) DEFECT_QTY, N.DEFECT_NAME, N.PART_NAME
FROM (
  SELECT a.ENDLINE_SCHD_DATE, a.ENDLINE_ACT_SCHD_ID, d.SITE_NAME, d.LINE_NAME, d.SHIFT, a.ENDLINE_PLAN_SIZE, 
          f.CUSTOMER_NAME, f.ORDER_REFERENCE_PO_NO, f.ORDER_STYLE_DESCRIPTION, f.ITEM_COLOR_NAME, f.PRODUCT_ITEM_CODE,
          HOUR(a.ENDLINE_ADD_TIME) ENDLINE_TIME, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE, 
          a.ENDLINE_OUT_QTY, b.DEFECT_NAME, c.PART_NAME
  FROM qc_endline_output a 
  LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE 
  LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
  LEFT JOIN item_siteline d ON a.ENDLINE_ID_SITELINE = d.ID_SITELINE
  LEFT JOIN weekly_prod_sch_detail e ON e.SCHD_ID = a.ENDLINE_ACT_SCHD_ID
  LEFT JOIN viewcapacity f ON f.ID_CAPACITY = e.SCHD_CAPACITY_ID
  WHERE a.ENDLINE_SCHD_DATE = :schDate AND d.SITE_NAME =:sitename AND d.SHIFT = :shift
  AND  a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL 
) N 
LEFT JOIN (
	SELECT 
	   n.ENDLINE_SCHD_DATE, n.ENDLINE_ID_SITELINE,  n.ENDLINE_ACT_SCHD_ID, n.ENDLINE_TIME, n.ENDLINE_PLAN_SIZE,
	   IFNULL(n.RTT,0) RTT,
	   IFNULL(n.DEFECT, 0) AS DEFECT,
	   IFNULL(n.REPAIRED, 0) AS REPAIRED,
	   IFNULL(n.BS, 0) AS BS,
	   IFNULL(n.RTT,0)+IFNULL(n.DEFECT,0)+IFNULL(n.BS, 0) CHECKED,
	   IFNULL(n.RTT, 0) + IFNULL(n.REPAIRED, 0) GOOD
	FROM (
			SELECT
			    c.ENDLINE_SCHD_DATE,
			    c.ENDLINE_ID_SITELINE,
			    c.ENDLINE_ACT_SCHD_ID,
			    c.ENDLINE_TIME,
			    c.ENDLINE_PLAN_SIZE,
			    SUM(c.RFT) AS RTT,
			    SUM(c.DEFECT) AS DEFECT,
			    SUM(c.REPAIRED) AS REPAIRED,
			    SUM(c.BS) AS BS
			FROM (
			    SELECT
			        DATE(a.ENDLINE_SCHD_DATE) AS ENDLINE_SCHD_DATE,
			        a.ENDLINE_ID_SITELINE,
			        a.ENDLINE_ACT_SCHD_ID,
			        a.ENDLINE_PLAN_SIZE,	
			        HOUR(a.ENDLINE_TIME) AS ENDLINE_TIME,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'RTT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS RFT,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS DEFECT,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'BS' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS BS,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND a.ENDLINE_REPAIR = 'Y' 
			            AND DATE(a.ENDLINE_MOD_TIME) = :schDate THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS REPAIRED
			    FROM qc_endline_output a
			    LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
			    WHERE DATE(a.ENDLINE_ADD_TIME) = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift
			    AND (a.ENDLINE_OUT_TYPE = 'RTT' OR (a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y') OR a.ENDLINE_OUT_TYPE = 'BS'
			    OR (a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y' AND DATE(a.ENDLINE_MOD_TIME) = :schDate))
			) c
			GROUP BY c.ENDLINE_SCHD_DATE, c.ENDLINE_ID_SITELINE, c.ENDLINE_ACT_SCHD_ID, c.ENDLINE_TIME, c.ENDLINE_PLAN_SIZE
	)n
) M ON N.ENDLINE_ACT_SCHD_ID = M.ENDLINE_ACT_SCHD_ID AND M.ENDLINE_TIME = N.ENDLINE_TIME AND M.ENDLINE_PLAN_SIZE = N.ENDLINE_PLAN_SIZE
GROUP BY N.ENDLINE_SCHD_DATE, N.ENDLINE_ACT_SCHD_ID,  N.ENDLINE_TIME, N.ENDLINE_PLAN_SIZE, N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE`;

export const QueryDtlDayDefSum = `SELECT N.ENDLINE_SCHD_DATE, N.ENDLINE_ACT_SCHD_ID, N.SITE_NAME, N.LINE_NAME, N.SHIFT,
N.CUSTOMER_NAME, N.ORDER_REFERENCE_PO_NO, N.ORDER_STYLE_DESCRIPTION, N.ITEM_COLOR_NAME, N.PRODUCT_ITEM_CODE,
N.ENDLINE_TIME, SEC_TO_TIME(N.ENDLINE_TIME*3600) ENDLINE_TIME_FORMAT, N.ENDLINE_PLAN_SIZE,
N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE, M.CHECKED, M.GOOD,
SUM(N.ENDLINE_OUT_QTY) DEFECT_QTY, N.DEFECT_NAME, N.PART_NAME
FROM (
  SELECT a.ENDLINE_SCHD_DATE, a.ENDLINE_ACT_SCHD_ID, d.SITE_NAME, d.LINE_NAME, d.SHIFT, a.ENDLINE_PLAN_SIZE, 
          f.CUSTOMER_NAME, f.ORDER_REFERENCE_PO_NO, f.ORDER_STYLE_DESCRIPTION, f.ITEM_COLOR_NAME, f.PRODUCT_ITEM_CODE,
          HOUR(a.ENDLINE_ADD_TIME) ENDLINE_TIME, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE, 
          a.ENDLINE_OUT_QTY, b.DEFECT_NAME, c.PART_NAME
  FROM qc_endline_output a 
  LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE 
  LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
  LEFT JOIN item_siteline d ON a.ENDLINE_ID_SITELINE = d.ID_SITELINE
  LEFT JOIN weekly_prod_sch_detail e ON e.SCHD_ID = a.ENDLINE_ACT_SCHD_ID
  LEFT JOIN viewcapacity f ON f.ID_CAPACITY = e.SCHD_CAPACITY_ID
  WHERE a.ENDLINE_SCHD_DATE = :schDate AND d.SITE_NAME =:sitename AND d.SHIFT = :shift
  AND  a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL 
) N 
JOIN 
(
	SELECT 
	   n.ENDLINE_SCHD_DATE, n.ENDLINE_ID_SITELINE,  n.ENDLINE_ACT_SCHD_ID, n.ENDLINE_TIME, n.ENDLINE_PLAN_SIZE,
	   IFNULL(n.RTT,0) RTT,
	   IFNULL(n.DEFECT, 0) AS DEFECT,
	   IFNULL(n.REPAIRED, 0) AS REPAIRED,
	   IFNULL(n.BS, 0) AS BS,
	   IFNULL(n.RTT,0)+IFNULL(n.DEFECT,0) CHECKED,
	   IFNULL(n.RTT, 0) + IFNULL(n.REPAIRED, 0) GOOD
	FROM (
			SELECT
			    c.ENDLINE_SCHD_DATE,
			    c.ENDLINE_ID_SITELINE,
			    c.ENDLINE_ACT_SCHD_ID,
			    c.ENDLINE_TIME,
			    c.ENDLINE_PLAN_SIZE,
			    SUM(c.RFT) AS RTT,
			    SUM(c.DEFECT) AS DEFECT,
			    SUM(c.REPAIRED) AS REPAIRED,
			    SUM(c.BS) AS BS
			FROM (
			    SELECT
			        DATE(a.ENDLINE_SCHD_DATE) AS ENDLINE_SCHD_DATE,
			        a.ENDLINE_ID_SITELINE,
			        a.ENDLINE_ACT_SCHD_ID,
			        a.ENDLINE_PLAN_SIZE,	
			        HOUR(a.ENDLINE_TIME) AS ENDLINE_TIME,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'RTT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS RFT,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS DEFECT,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'BS' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS BS,
			        CASE
			            WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND a.ENDLINE_REPAIR = 'Y' 
			            AND DATE(a.ENDLINE_MOD_TIME) = :schDate THEN a.ENDLINE_OUT_QTY
			            ELSE 0
			        END AS REPAIRED
			    FROM qc_endline_output a
			    LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
			    WHERE DATE(a.ENDLINE_ADD_TIME) = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift
			    AND (a.ENDLINE_OUT_TYPE = 'RTT' OR (a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y') OR a.ENDLINE_OUT_TYPE = 'BS'
			    OR (a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y' AND DATE(a.ENDLINE_MOD_TIME) = :schDate))
			) c
			GROUP BY c.ENDLINE_SCHD_DATE, c.ENDLINE_ID_SITELINE, c.ENDLINE_ACT_SCHD_ID, c.ENDLINE_TIME, c.ENDLINE_PLAN_SIZE
	)n
) M ON N.ENDLINE_ACT_SCHD_ID = M.ENDLINE_ACT_SCHD_ID AND M.ENDLINE_TIME = N.ENDLINE_TIME AND M.ENDLINE_PLAN_SIZE = N.ENDLINE_PLAN_SIZE
GROUP BY N.ENDLINE_SCHD_DATE, N.ENDLINE_ACT_SCHD_ID,  N.ENDLINE_DEFECT_CODE, N.ENDLINE_PART_CODE`;

//measurement Rerport querryyyy
export const QueryGetDescMes = `-- QUERY QC measurement desc list
SELECT a.MES_CHART_NO, a.ORDER_NO, c.POM_ID, a.MES_UOM, c.POM_DESC, c.POM_PLUS, c.POM_MIN
FROM (
	SELECT a.MES_CHART_NO, a.ORDER_NO, b.MES_UOM, a.ADD_DATE 
	FROM measurement_and_order a 
	LEFT JOIN measurement_chart b ON b.MES_CHART_NO = a.MES_CHART_NO
	WHERE a.ORDER_NO = :orderNo ORDER BY a.ADD_DATE DESC LIMIT 1 
) a 
LEFT JOIN measurement_pom c ON c.MES_CHART_NO = a.MES_CHART_NO `;

export const QueryMeasSpecRep = `SELECT a.MES_CHART_NO, a.ORDER_NO, c.POM_ID, b.SIZE_CODE, b.SPEC
FROM (
	SELECT a.MES_CHART_NO, a.ORDER_NO, b.MES_UOM, a.ADD_DATE 
	FROM measurement_and_order a 
	LEFT JOIN measurement_chart b ON b.MES_CHART_NO = a.MES_CHART_NO
	WHERE a.ORDER_NO = :orderNo ORDER BY a.ADD_DATE DESC LIMIT 1 
) a 
LEFT JOIN measurement_chart_detail b ON a.MES_CHART_NO = b.MES_CHART_NO
LEFT JOIN measurement_pom c ON c.MES_CHART_NO = a.MES_CHART_NO  AND b.POM_ID = c.POM_ID
WHERE b.SIZE_CODE IN (
	SELECT DISTINCT b.SIZE_CODE FROM measurement_qc_output b 
	WHERE b.SCHD_ID = :schdId AND b.SHIFT = :shift
)`;

export const QueryMesValueRep = `SELECT a.MES_CHART_NO, a.POM_ID, a.SIZE_CODE, a.MES_VALUE, a.BARCODE_SERIAL, a.MES_SEQ, a.MES_CAT, a.ORDER_NO, b.MES_UOM
FROM measurement_qc_output a 
LEFT JOIN measurement_chart b ON a.MES_CHART_NO = b.MES_CHART_NO
WHERE a.SCHD_ID = :schdId AND a.SHIFT = :shift
 `;

export const QryMesHederRepList = `-- query looping header measurement report 
SELECT DISTINCT a.BARCODE_SERIAL, a.SIZE_CODE, c.BUNDLE_SEQUENCE
FROM measurement_qc_output a 
LEFT JOIN measurement_chart b ON a.MES_CHART_NO = b.MES_CHART_NO
LEFT JOIN order_qr_generate c ON a.BARCODE_SERIAL = c.BARCODE_SERIAL 
WHERE a.SCHD_ID = :schdId AND a.SHIFT = :shift
`;
