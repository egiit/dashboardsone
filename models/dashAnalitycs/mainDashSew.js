export const QueryMainSewDash = `SELECT	
I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.CUS_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.FOREMAN, I.SCHD_DAYS_NUMBER, 
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE,
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION, 
I.PLAN_SEW_SMV, 
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
gl.SHIFT_START_HOUR STARTH, gl.SHIFT_END_HOUR ENDH, (I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE TPPM_NORMAL,
FIND_RTT(gl.SHIFT_START_HOUR, gl.SHIFT_END_HOUR, :schDate, I.ACT_TARGET, 	 ((I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE), 'Normal_A') RTT,
FIND_RTT_OT(gl.SHIFT_END_HOUR, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_OT MINUTE), :schDate, ACT_TARGET_OT, ACT_TARGET_OT/PLAN_WH_OT) RTT_OT, 
FIND_RTT_OT(gl.SHIFT_HOURLY_OT2, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_X_OT MINUTE), :schDate, ACT_TARGET_X_OT, ACT_TARGET_X_OT/PLAN_WH_X_OT) RTT_X_OT,
I.TOTAL_OUTPUT
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.CUS_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER, 
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM, h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE, h.FOREMAN,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION, 
        h.PLAN_SEW_SMV,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        -- IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
        h.ACT_TARGET,
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT, h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        h.ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        IFNULL(h.TOTAL_OUTPUT, 0) TOTAL_OUTPUT,  -- actual ouput
        h.WH_PERCENTAGE
        FROM(
					SELECT a.*, (a.PLAN_WH/ f.PLAN_WH) WH_PERCENTAGE , a.CUSTOMER_NAME CUSTOMER_PROGRAM, b.CUS_NAME, b.FOREMAN
					FROM log_daily_output a 
					LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ID_SITELINE
					LEFT JOIN 	(
					       -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
					       SELECT DISTINCT  a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, b.START_TIME, b.END_TIME,
					        a.PLAN_WH, a.PLAN_MP
					       FROM manpower_detail a 
					       LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
					       WHERE a.MP_DATE = :schDate   AND b.SHIFT = 'Normal_A' -- AND b.ID_SITELINE = 'SLD0000001' AND b.SITE_NAME = :sitename
					       ORDER by a.ID_SITELINE
					) f ON f.LINE_NAME = a.LINE_NAME AND a.SITE_NAME = f.SITE_NAME
					WHERE a.SCHD_PROD_DATE = :schDate AND a.SHIFT = 'Normal_A'
        )h
    ) I LEFT JOIN item_working_shift gl ON gl.SHIFT_ID = 'Normal_A' AND INSTR(gl.SHIFT_DAYS, DAYNAME(:schDate)) > 1
UNION ALL 
SELECT	
I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.CUS_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.FOREMAN, I.SCHD_DAYS_NUMBER, 
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE,
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION, 
I.PLAN_SEW_SMV, 
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
gl.SHIFT_START_HOUR STARTH, gl.SHIFT_END_HOUR ENDH, (I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE TPPM_NORMAL,
FIND_RTT(gl.SHIFT_START_HOUR, gl.SHIFT_END_HOUR, :schDate, I.ACT_TARGET, 	 ((I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE), 'Shift_A') RTT,
FIND_RTT_OT(gl.SHIFT_END_HOUR, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_OT MINUTE), :schDate, ACT_TARGET_OT, ACT_TARGET_OT/PLAN_WH_OT) RTT_OT, 
FIND_RTT_OT(gl.SHIFT_HOURLY_OT2, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_X_OT MINUTE), :schDate, ACT_TARGET_X_OT, ACT_TARGET_X_OT/PLAN_WH_X_OT) RTT_X_OT,
I.TOTAL_OUTPUT
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.CUS_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER, 
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM, h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE, h.FOREMAN,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION, 
        h.PLAN_SEW_SMV,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        -- IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
        h.ACT_TARGET,
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT, h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        h.ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        IFNULL(h.TOTAL_OUTPUT, 0) TOTAL_OUTPUT,  -- actual ouput
        h.WH_PERCENTAGE
        FROM(
					SELECT a.*, (a.PLAN_WH/ f.PLAN_WH) WH_PERCENTAGE , a.CUSTOMER_NAME CUSTOMER_PROGRAM, b.CUS_NAME,  b.FOREMAN
					FROM log_daily_output a 
					LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ID_SITELINE
					LEFT JOIN 	(
					       -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
					       SELECT DISTINCT  a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, b.START_TIME, b.END_TIME,
					        a.PLAN_WH, a.PLAN_MP
					       FROM manpower_detail a 
					       LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
					       WHERE a.MP_DATE = :schDate   AND b.SHIFT = 'Shift_A' -- AND b.ID_SITELINE = 'SLD0000001' AND b.SITE_NAME = :sitename
					       ORDER by a.ID_SITELINE
					) f ON f.LINE_NAME = a.LINE_NAME AND a.SITE_NAME = f.SITE_NAME
					WHERE a.SCHD_PROD_DATE = :schDate AND a.SHIFT = 'Shift_A'
        )h
    ) I LEFT JOIN item_working_shift gl ON gl.SHIFT_ID = 'Shift_A' AND INSTR(gl.SHIFT_DAYS, DAYNAME(:schDate)) > 1
UNION ALL 
SELECT	
I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.CUS_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.FOREMAN, I.SCHD_DAYS_NUMBER, 
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE,
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION, 
I.PLAN_SEW_SMV, 
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
gl.SHIFT_START_HOUR STARTH, gl.SHIFT_END_HOUR ENDH, (I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE TPPM_NORMAL,
FIND_RTT(gl.SHIFT_START_HOUR, gl.SHIFT_END_HOUR, :schDate, I.ACT_TARGET, 	 ((I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE), 'Shift_B') RTT,
FIND_RTT_OT(gl.SHIFT_END_HOUR, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_OT MINUTE), :schDate, ACT_TARGET_OT, ACT_TARGET_OT/PLAN_WH_OT) RTT_OT, 
FIND_RTT_OT(gl.SHIFT_HOURLY_OT2, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_X_OT MINUTE), :schDate, ACT_TARGET_X_OT, ACT_TARGET_X_OT/PLAN_WH_X_OT) RTT_X_OT,
I.TOTAL_OUTPUT
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.CUS_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER, 
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM, h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE, h.FOREMAN,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION, 
        h.PLAN_SEW_SMV,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        -- IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
        h.ACT_TARGET,
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT, h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        h.ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        IFNULL(h.TOTAL_OUTPUT, 0) TOTAL_OUTPUT,  -- actual ouput
        h.WH_PERCENTAGE
        FROM(
					SELECT a.*, (a.PLAN_WH/ f.PLAN_WH) WH_PERCENTAGE , a.CUSTOMER_NAME CUSTOMER_PROGRAM, b.CUS_NAME, b.FOREMAN
					FROM log_daily_output a 
					LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ID_SITELINE 
					LEFT JOIN 	(
					       -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
					       SELECT DISTINCT  a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, b.START_TIME, b.END_TIME,
					        a.PLAN_WH, a.PLAN_MP
					       FROM manpower_detail a 
					       LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
					       WHERE a.MP_DATE = :schDate   AND b.SHIFT = 'Shift_B' -- AND b.ID_SITELINE = 'SLD0000001' AND b.SITE_NAME = :sitename
					       ORDER by a.ID_SITELINE
					) f ON f.LINE_NAME = a.LINE_NAME AND a.SITE_NAME = f.SITE_NAME
					WHERE a.SCHD_PROD_DATE = :schDate AND a.SHIFT = 'Shift_B'
        )h
    ) I LEFT JOIN item_working_shift gl ON gl.SHIFT_ID = 'Shift_B' AND INSTR(gl.SHIFT_DAYS, DAYNAME(:schDate)) > 1`;
// export const QueryMainSewDash = `SELECT
// I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.CUS_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
// I.ORDER_REFERENCE_PO_NO, I.FOREMAN, I.SCHD_DAYS_NUMBER,
// I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE,
// I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION,
// I.PLAN_SEW_SMV,
// I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
// I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT,
// I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
// I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
// I.TOTAL_TARGET,
// gl.SHIFT_START_HOUR STARTH, gl.SHIFT_END_HOUR ENDH, (I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE TPPM_NORMAL,
// FIND_RTT(gl.SHIFT_START_HOUR, gl.SHIFT_END_HOUR, :schDate, I.ACT_TARGET, 	 ((I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE), 'Normal_A') RTT,
// FIND_RTT_OT(gl.SHIFT_END_HOUR, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_OT MINUTE), :schDate, ACT_TARGET_OT, ACT_TARGET_OT/PLAN_WH_OT) RTT_OT,
// FIND_RTT_OT(gl.SHIFT_HOURLY_OT2, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_X_OT MINUTE), :schDate, ACT_TARGET_X_OT, ACT_TARGET_X_OT/PLAN_WH_X_OT) RTT_X_OT,
// I.TOTAL_OUTPUT
// FROM (
// SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.CUS_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
//         h.ORDER_REFERENCE_PO_NO, h.FOREMAN, h.SCHD_DAYS_NUMBER,
//         h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM, h.PRODUCT_ITEM_CODE,
//         h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION,
//         h.PLAN_SEW_SMV,
//         h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET,
//         -- IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
//         h.ACT_TARGET,
//         h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT, h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
//         h.PLAN_TARGET_OT PLAN_TARGET_OT,
//         IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
//         IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
//         IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
//         IFNULL(h.TOTAL_OUTPUT, 0) TOTAL_OUTPUT,  -- actual ouput
//         h.WH_PERCENTAGE
//         FROM(
//         SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME,  n.CUS_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
//                 n.ORDER_REFERENCE_PO_NO, n.FOREMAN, n.SCHD_DAYS_NUMBER,
//                 n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE,
//                 n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,
//                 	n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP,
//                 (n.PLAN_WH/ n.MASTER_WH) WH_PERCENTAGE ,
//                 n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
//                 n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
//                 n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT,
//                 n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
//                 n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
//                 n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
//                 n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
//                 n.TOTAL_OUTPUT
//             FROM (
//                     SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME,  d.CUS_NAME, d.LINE_NAME, e.SHIFT,
//                     IF(SUBSTRING('Normal_A' ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
//                     b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
//                     b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE,
//                     b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,
//                     FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
//                   	IFNULL(m.PLAN_MP,e.PLAN_MP)  PLAN_MP,
//                     	IFNULL(f.PLAN_WH,e.PLAN_WH)  PLAN_WH,
//      					  e.PLAN_WH MASTER_WH,
//                     m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP,
//                     FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
//                     FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
//                     p.TOTAL_OUTPUT,
// 						  k.SHIFT_END_HOUR
//                      -- CASE WHEN l.SEQ_NORMAL = 1 THEN d.START_TIME
//                     FROM weekly_prod_sch_detail a
//                     LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY
//                     LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
//                     --	untuk aktual SMV
//                     LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = 'Normal_A'
//                     LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
//                     LEFT JOIN 	(
//                             -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
//                             SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, b.START_TIME, b.END_TIME,
//                              a.PLAN_WH, a.PLAN_MP
//                             FROM manpower_detail a
//                             LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
//                             WHERE a.MP_DATE = :schDate   AND b.SHIFT = 'Normal_A' -- AND b.ID_SITELINE = 'SLD0000001' AND b.SITE_NAME = :sitename
//                             ORDER by a.ID_SITELINE
//                     ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
//                     -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
//                     LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = 'Normal_A'
//                     LEFT JOIN (
//                         SELECT DISTINCT a.SCHD_ID, a.LINE_NAME, a.SHIFT, a.PLAN_MP, a.ACT_MP, a.PLAN_MP_OT, a.ACT_MP_OT, a.PLAN_MP_X_OT, a.ACT_MP_X_OT
//                         FROM   mp_daily_detail a  WHERE a.SHIFT = 'Normal_A' AND DATE(a.CREATE_DATE) = :schDate
//                         GROUP BY a.SCHD_ID, a.LINE_NAME, a.SHIFT
//                     ) m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = 'Normal_A'
//                     -- left join ciew qcendlineoutput untuk mendapatkan output
//                     LEFT JOIN (
//                             SELECT N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_SCHD_DATE,  N.ENDLINE_SCH_ID, N.ENDLINE_ID_SITELINE, N.ENDLINE_LINE_NAME,
// 									SUM(N.ENDLINE_OUT_QTY) TOTAL_OUTPUT
// 									FROM(
// 									-- normal
// 										SELECT
// 										a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
// 										a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
// 										FROM qc_endline_output a
// 										LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
// 										WHERE   a.ENDLINE_SCHD_DATE = CURDATE() AND b.SHIFT = 'Normal_A' AND
// 										a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL
// 										-- RTT n Repair
// 										UNION ALL
// 										SELECT
// 											a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
// 											a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
// 										FROM qc_endline_output a
// 										LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
// 										WHERE  DATE(a.ENDLINE_MOD_TIME) = CURDATE() AND b.SHIFT = 'Normal_A' AND
// 										a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL
// 									) N
// 									GROUP BY  N.ENDLINE_ACT_SCHD_ID
//                     ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
//                     -- LEFT JOIN out_prod_time_view l ON l.ENDLINE_ACT_SCHD_ID = a.SCHD_ID AND l.ENDLINE_ID_SITELINE = e.ID_SITELINE AND l.ENDLINE_SCHD_DATE = :schDate
//                     LEFT JOIN item_working_shift k ON k.SHIFT_ID  = 'Normal_A' AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate)) > 1
//                     WHERE a.SCHD_PROD_DATE = :schDate  AND  e.SHIFT = 'Normal_A' -- AND d.SITE_NAME = :sitename -- AND e.MP_DATE = :schDate-- AND d.SITE_NAME = :sitename AND d.LINE_NAME = 'LINE-01'
//             )n
//         )h
//     ) I LEFT JOIN item_working_shift gl ON gl.SHIFT_ID = 'Normal_A' AND INSTR(gl.SHIFT_DAYS, DAYNAME(:schDate)) > 1
// UNION ALL
// SELECT
// I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.CUS_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
// I.ORDER_REFERENCE_PO_NO, I.FOREMAN, I.SCHD_DAYS_NUMBER,
// I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE,
// I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION,
// I.PLAN_SEW_SMV,
// I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
// I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT,
// I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
// I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
// I.TOTAL_TARGET,
// gl.SHIFT_START_HOUR STARTH, gl.SHIFT_END_HOUR ENDH, (I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE TPPM_NORMAL,
// FIND_RTT(gl.SHIFT_START_HOUR, gl.SHIFT_END_HOUR, :schDate, I.ACT_TARGET, 	 ((I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE), 'Shift_A') RTT,
// FIND_RTT_OT(gl.SHIFT_END_HOUR, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_OT MINUTE), :schDate, ACT_TARGET_OT, ACT_TARGET_OT/PLAN_WH_OT) RTT_OT,
// FIND_RTT_OT(gl.SHIFT_HOURLY_OT2, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_X_OT MINUTE), :schDate, ACT_TARGET_X_OT, ACT_TARGET_X_OT/PLAN_WH_X_OT) RTT_X_OT,
// I.TOTAL_OUTPUT
// FROM (
// SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.CUS_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
//         h.ORDER_REFERENCE_PO_NO, h.FOREMAN, h.SCHD_DAYS_NUMBER,
//         h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM, h.PRODUCT_ITEM_CODE,
//         h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION,
//         h.PLAN_SEW_SMV,
//         h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET,
//         -- IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
//         h.ACT_TARGET,
//         h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT, h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
//         h.PLAN_TARGET_OT PLAN_TARGET_OT,
//         IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
//         IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
//         IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
//         IFNULL(h.TOTAL_OUTPUT, 0) TOTAL_OUTPUT,  -- actual ouput
//         h.WH_PERCENTAGE
//         FROM(
//         SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME,  n.CUS_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
//                 n.ORDER_REFERENCE_PO_NO, n.FOREMAN, n.SCHD_DAYS_NUMBER,
//                 n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE,
//                 n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,
//                 	n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP,
//                 (n.PLAN_WH/ n.MASTER_WH) WH_PERCENTAGE ,
//                 n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
//                 n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
//                 n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT,
//                 n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
//                 n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
//                 n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
//                 n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
//                 n.TOTAL_OUTPUT
//             FROM (
//                     SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME,  d.CUS_NAME, d.LINE_NAME, e.SHIFT,
//                     IF(SUBSTRING('Shift_A' ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
//                     b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
//                     b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE,
//                     b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,
//                     FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
//                   	IFNULL(m.PLAN_MP,e.PLAN_MP)  PLAN_MP,
//                     	IFNULL(f.PLAN_WH,e.PLAN_WH)  PLAN_WH,
//      					  e.PLAN_WH MASTER_WH,
//                     m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP,
//                     FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
//                     FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
//                     p.TOTAL_OUTPUT,
// 						  k.SHIFT_END_HOUR
//                      -- CASE WHEN l.SEQ_NORMAL = 1 THEN d.START_TIME
//                     FROM weekly_prod_sch_detail a
//                     LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY
//                     LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
//                     --	untuk aktual SMV
//                     LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = 'Shift_A'
//                     LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
//                     LEFT JOIN 	(
//                             -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
//                             SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, b.START_TIME, b.END_TIME,
//                              a.PLAN_WH, a.PLAN_MP
//                             FROM manpower_detail a
//                             LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
//                             WHERE a.MP_DATE = :schDate   AND b.SHIFT = 'Shift_A' -- AND b.ID_SITELINE = 'SLD0000001' AND b.SITE_NAME = :sitename
//                             ORDER by a.ID_SITELINE
//                     ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
//                     -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
//                     LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = 'Shift_A'
//                     LEFT JOIN (
//                         SELECT DISTINCT a.SCHD_ID, a.LINE_NAME, a.SHIFT, a.PLAN_MP, a.ACT_MP, a.PLAN_MP_OT, a.ACT_MP_OT, a.PLAN_MP_X_OT, a.ACT_MP_X_OT
//                         FROM   mp_daily_detail a  WHERE a.SHIFT = 'Shift_A' AND DATE(a.CREATE_DATE) = :schDate
//                         GROUP BY a.SCHD_ID, a.LINE_NAME, a.SHIFT
//                     ) m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = 'Shift_A'
//                     -- left join ciew qcendlineoutput untuk mendapatkan output
//                     LEFT JOIN (
//                             SELECT N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_SCHD_DATE,  N.ENDLINE_SCH_ID, N.ENDLINE_ID_SITELINE, N.ENDLINE_LINE_NAME,
// 									SUM(N.ENDLINE_OUT_QTY) TOTAL_OUTPUT
// 									FROM(
// 									-- normal
// 										SELECT
// 										a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
// 										a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
// 										FROM qc_endline_output a
// 										LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
// 										WHERE   a.ENDLINE_SCHD_DATE = CURDATE() AND b.SHIFT = 'Shift_A' AND
// 										a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL
// 										-- RTT n Repair
// 										UNION ALL
// 										SELECT
// 											a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
// 											a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
// 										FROM qc_endline_output a
// 										LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
// 										WHERE   DATE(a.ENDLINE_MOD_TIME) = CURDATE() AND b.SHIFT = 'Shift_A' AND
// 										a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL
// 									) N
// 									GROUP BY  N.ENDLINE_ACT_SCHD_ID
//                     ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
//                     -- LEFT JOIN out_prod_time_view l ON l.ENDLINE_ACT_SCHD_ID = a.SCHD_ID AND l.ENDLINE_ID_SITELINE = e.ID_SITELINE AND l.ENDLINE_SCHD_DATE = :schDate
//                     LEFT JOIN item_working_shift k ON k.SHIFT_ID  = 'Shift_A' AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate)) > 1
//                     WHERE a.SCHD_PROD_DATE = :schDate  AND  e.SHIFT = 'Shift_A' -- AND d.SITE_NAME = :sitename -- AND e.MP_DATE = :schDate-- AND d.SITE_NAME = :sitename AND d.LINE_NAME = 'LINE-01'
//             )n
//         )h
//     ) I LEFT JOIN item_working_shift gl ON gl.SHIFT_ID = 'Shift_A' AND INSTR(gl.SHIFT_DAYS, DAYNAME(:schDate)) > 1
// UNION ALL
// SELECT
// I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.CUS_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
// I.ORDER_REFERENCE_PO_NO, I.FOREMAN, I.SCHD_DAYS_NUMBER,
// I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE,
// I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION,
// I.PLAN_SEW_SMV,
// I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
// I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT,
// I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
// I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
// I.TOTAL_TARGET,
// gl.SHIFT_START_HOUR STARTH, gl.SHIFT_END_HOUR ENDH, (I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE TPPM_NORMAL,
// FIND_RTT(gl.SHIFT_START_HOUR, gl.SHIFT_END_HOUR, :schDate, I.ACT_TARGET, 	 ((I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE), 'Shift_B') RTT,
// FIND_RTT_OT(gl.SHIFT_END_HOUR, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_OT MINUTE), :schDate, ACT_TARGET_OT, ACT_TARGET_OT/PLAN_WH_OT) RTT_OT,
// FIND_RTT_OT(gl.SHIFT_HOURLY_OT2, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_X_OT MINUTE), :schDate, ACT_TARGET_X_OT, ACT_TARGET_X_OT/PLAN_WH_X_OT) RTT_X_OT,
// I.TOTAL_OUTPUT
// FROM (
// SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.CUS_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
//         h.ORDER_REFERENCE_PO_NO, h.FOREMAN, h.SCHD_DAYS_NUMBER,
//         h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM, h.PRODUCT_ITEM_CODE,
//         h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION,
//         h.PLAN_SEW_SMV,
//         h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET,
//         -- IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
//         h.ACT_TARGET,
//         h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT, h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
//         h.PLAN_TARGET_OT PLAN_TARGET_OT,
//         IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
//         IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
//         IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
//         IFNULL(h.TOTAL_OUTPUT, 0) TOTAL_OUTPUT,  -- actual ouput
//         h.WH_PERCENTAGE
//         FROM(
//         SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME,  n.CUS_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
//                 n.ORDER_REFERENCE_PO_NO, n.FOREMAN, n.SCHD_DAYS_NUMBER,
//                 n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE,
//                 n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,
//                 	n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP,
//                 (n.PLAN_WH/ n.MASTER_WH) WH_PERCENTAGE ,
//                 n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
//                 n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
//                 n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT,
//                 n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
//                 n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
//                 n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
//                 n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
//                 n.TOTAL_OUTPUT
//             FROM (
//                     SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME,  d.CUS_NAME, d.LINE_NAME, e.SHIFT,
//                     IF(SUBSTRING('Shift_B' ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
//                     b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
//                     b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE,
//                     b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,
//                     FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
//                   	IFNULL(m.PLAN_MP,e.PLAN_MP)  PLAN_MP,
//                     	IFNULL(f.PLAN_WH,e.PLAN_WH)  PLAN_WH,
//      					  e.PLAN_WH MASTER_WH,
//                     m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP,
//                     FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
//                     FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
//                     p.TOTAL_OUTPUT,
// 						  k.SHIFT_END_HOUR
//                      -- CASE WHEN l.SEQ_NORMAL = 1 THEN d.START_TIME
//                     FROM weekly_prod_sch_detail a
//                     LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY
//                     LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
//                     --	untuk aktual SMV
//                     LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = 'Shift_B'
//                     LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
//                     LEFT JOIN 	(
//                             -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
//                             SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, b.START_TIME, b.END_TIME,
//                              a.PLAN_WH, a.PLAN_MP
//                             FROM manpower_detail a
//                             LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
//                             WHERE a.MP_DATE = :schDate   AND b.SHIFT = 'Shift_B' -- AND b.ID_SITELINE = 'SLD0000001' AND b.SITE_NAME = :sitename
//                             ORDER by a.ID_SITELINE
//                     ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
//                     -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
//                     LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = 'Shift_B'
//                     LEFT JOIN (
//                         SELECT DISTINCT a.SCHD_ID, a.LINE_NAME, a.SHIFT, a.PLAN_MP, a.ACT_MP, a.PLAN_MP_OT, a.ACT_MP_OT, a.PLAN_MP_X_OT, a.ACT_MP_X_OT
//                         FROM   mp_daily_detail a  WHERE a.SHIFT = 'Shift_B' AND DATE(a.CREATE_DATE) = :schDate
//                         GROUP BY a.SCHD_ID, a.LINE_NAME, a.SHIFT
//                     ) m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = 'Shift_B'
//                     -- left join ciew qcendlineoutput untuk mendapatkan output
//                     LEFT JOIN (
//                             SELECT N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_SCHD_DATE,  N.ENDLINE_SCH_ID, N.ENDLINE_ID_SITELINE, N.ENDLINE_LINE_NAME,
// 									SUM(N.ENDLINE_OUT_QTY) TOTAL_OUTPUT
// 									FROM(
// 									-- normal
// 										SELECT
// 										a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
// 										a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
// 										FROM qc_endline_output a
// 										LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
// 										WHERE   a.ENDLINE_SCHD_DATE = CURDATE() AND b.SHIFT = 'Shift_B' AND
// 										a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL
// 										-- RTT n Repair
// 										UNION ALL
// 										SELECT
// 											a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
// 											a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT
// 										FROM qc_endline_output a
// 										LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
// 										WHERE   DATE(a.ENDLINE_MOD_TIME) = CURDATE() AND b.SHIFT = 'Shift_B' AND
// 										a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL
// 									) N
// 									GROUP BY  N.ENDLINE_ACT_SCHD_ID
//                     ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
//                     -- LEFT JOIN out_prod_time_view l ON l.ENDLINE_ACT_SCHD_ID = a.SCHD_ID AND l.ENDLINE_ID_SITELINE = e.ID_SITELINE AND l.ENDLINE_SCHD_DATE = :schDate
//                     LEFT JOIN item_working_shift k ON k.SHIFT_ID  = 'Shift_B' AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate)) > 1
//                     WHERE a.SCHD_PROD_DATE = :schDate  AND  e.SHIFT = 'Shift_B' -- AND d.SITE_NAME = :sitename -- AND e.MP_DATE = :schDate-- AND d.SITE_NAME = :sitename AND d.LINE_NAME = 'LINE-01'
//             )n
//         )h
//     ) I LEFT JOIN item_working_shift gl ON gl.SHIFT_ID = 'Shift_B' AND INSTR(gl.SHIFT_DAYS, DAYNAME(:schDate)) > 1`;

export const QueryMainSewDashPast = `SELECT 
a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.ID_SITELINE,  a.SITE_NAME, f.CUS_NAME, a.LINE_NAME, a.SHIFT, 
IF(SUBSTRING(a.SHIFT ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
a.PLAN_SEW_SMV, a.FT_NORMAL, a.LT_NORMAL, a.FT_OT, a.LT_OT,  a.FT_X_OT, a.LT_X_OT,
a.PLAN_MP, a.PLAN_WH, a.ACT_MP, a.PLAN_TARGET, 	a.ACT_TARGET, a.PLAN_WH_X_OT,
a.PLAN_MP_OT, a.PLAN_WH_OT,  a.ACT_MP_OT, 
a.PLAN_TARGET_OT, a.ACT_TARGET_OT,
a.ACT_MP_X_OT, a.ACT_TARGET_X_OT,
a.TOTAL_TARGET,
gl.SHIFT_START_HOUR STARTH, gl.SHIFT_END_HOUR ENDH, (a.ACT_TARGET/a.PLAN_WH) TPPM_NORMAL,
a.ACT_TARGET RTT,
a.ACT_TARGET_OT RTT_OT,
a.ACT_TARGET_X_OT RTT_X_OT,
a.NORMAL_OUTPUT,  a.OT_OUTPUT, a.X_OT_OUTPUT, a.TOTAL_OUTPUT,  
a.PLAN_EH, a.PLAN_AH, a.PLAN_EH_OT, a.PLAN_AH_OT,  a.PLAN_EH_X_OT, a.PLAN_AH_X_OT,
a.ACT_WH, a.ACT_WH_OT, a.ACT_WH_X_OT, a.ACTUAL_EH, 
IFNULL(a.PLAN_AH,0) ACTUAL_AH,
a.ACTUAL_EH_OT, 
IFNULL(a.PLAN_AH_OT,0) ACTUAL_AH_OT,
-- IF(a.ACTUAL_AH_OT < PLAN_AH_OT, PLAN_AH_OT, ACTUAL_AH_OT) ACTUAL_AH_OT, 
a.ACTUAL_EH_X_OT,
IFNULL(a.PLAN_AH_X_OT,0) ACTUAL_AH_X_OT,
-- IF(a.ACTUAL_AH_X_OT < PLAN_AH_X_OT, PLAN_AH_X_OT, ACTUAL_AH_X_OT)ACTUAL_AH_X_OT,
a.EFF_NORMAL,
a.EFF_OT,
a.EFF_X_OT,
a.SCHD_DAYS_NUMBER, a.CUSTOMER_NAME,  a.ORDER_REFERENCE_PO_NO, 
a.PRODUCT_ITEM_CODE, a.ORDER_STYLE_DESCRIPTION, a.ITEM_COLOR_CODE, a.ITEM_COLOR_NAME
FROM log_daily_output a
LEFT JOIN (
    SELECT DISTINCT a.SITE_NAME, a.CUS_NAME, a.SHIFT
    FROM item_siteline a 
    GROUP BY a.SITE_NAME 
) f ON f.SITE_NAME = a.SITE_NAME
LEFT JOIN item_working_shift gl ON gl.SHIFT_ID = a.SHIFT AND INSTR(gl.SHIFT_DAYS, DAYNAME(:schDate)) > 1
WHERE a.SCHD_PROD_DATE =:schDate -- AND a.SITE_NAME = :sitename AND a.SHIFT = :shift
ORDER BY a.ID_SITELINE`;

export const QueryDefRetDash = `SELECT a.ENDLINE_SCHD_DATE, a.ENDLINE_ID_SITELINE, e.SITE_NAME, e.SHIFT, d.CUSTOMER_NAME,
SUM(a.CHECKED) AS CHECKED, 
SUM(a.RTT)+SUM(a.REPAIRED) AS GOOD, 
SUM(a.DEFECT) AS DEFECT, 
SUM(a.REPAIRED) AS REPAIRED
FROM  (
	SELECT 
   a.ENDLINE_ID_SITELINE,
   a.ENDLINE_ACT_SCHD_ID,
   a.ENDLINE_SCHD_DATE,
   SUM(CASE WHEN a.ENDLINE_OUT_QTY  THEN a.ENDLINE_OUT_QTY ELSE 0 END)  AS CHECKED,
   SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'RTT'  THEN a.ENDLINE_OUT_QTY ELSE 0 END)  AS RTT,
   SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'DEFECT'  AND a.ENDLINE_REPAIR = 'Y'  THEN a.ENDLINE_OUT_QTY ELSE 0 END) AS REPAIRED,
   SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'DEFECT'  THEN a.ENDLINE_OUT_QTY ELSE 0 END) AS DEFECT
	FROM qc_endline_output a
	WHERE  IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND  a.ENDLINE_SCHD_DATE = :schDate
	GROUP BY a.ENDLINE_ID_SITELINE, a.ENDLINE_ACT_SCHD_ID
) a
LEFT JOIN weekly_prod_sch_detail b ON a.ENDLINE_ACT_SCHD_ID = b.SCHD_ID
LEFT JOIN weekly_prod_schedule c ON b.SCH_ID = c.SCH_ID
LEFT JOIN viewcapacity d ON c.SCH_CAPACITY_ID = d.ID_CAPACITY
LEFT JOIN item_siteline e ON e.ID_SITELINE = a.ENDLINE_ID_SITELINE
WHERE a.ENDLINE_SCHD_DATE = :schDate
GROUP BY  a.ENDLINE_SCHD_DATE, a.ENDLINE_ID_SITELINE, e.SITE_NAME, d.CUSTOMER_NAME`;

export const QueryGet3topDef = `SELECT  
a.ENDLINE_SCHD_DATE AS SCHEDULE_DATE,
c.SITE_NAME,
c.LINE_NAME,
c.SHIFT,
f.CUSTOMER_NAME,
a.ENDLINE_DEFECT_CODE AS DEFECT_CODE,
b.DEFECT_NAME AS DEFECT_NAME,
a.ENDLINE_OUT_QTY DEFECT_QTY
-- SUM(a.ENDLINE_OUT_QTY) AS DEFECT_QTY
FROM qc_endline_output a
LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE
LEFT JOIN item_siteline c ON a.ENDLINE_ID_SITELINE = c.ID_SITELINE 
LEFT JOIN weekly_prod_sch_detail d ON d.SCHD_ID = a.ENDLINE_ACT_SCHD_ID
LEFT JOIN weekly_prod_schedule e	ON e.SCH_ID = d.SCH_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = e.SCH_CAPACITY_ID
WHERE 
DATE(a.ENDLINE_ADD_TIME) = :schDate AND
a.ENDLINE_OUT_TYPE = 'DEFECT' AND 
a.ENDLINE_OUT_UNDO IS NULL 
--	GROUP BY a.ENDLINE_SCHD_DATE, a.ENDLINE_DEFECT_CODE
-- ORDER BY SUM(a.ENDLINE_OUT_QTY) DESC LIMIT 3`;

export const QueryGet3Part = `SELECT  
a.ENDLINE_SCHD_DATE AS SCHEDULE_DATE,
c.SITE_NAME,
c.LINE_NAME,
c.SHIFT,
f.CUSTOMER_NAME,
g.PART_NAME,
a.ENDLINE_PART_CODE AS PART_CODE,
a.ENDLINE_DEFECT_CODE AS DEFECT_CODE,
b.DEFECT_NAME AS DEFECT_NAME,
a.ENDLINE_OUT_QTY DEFECT_QTY
-- SUM(a.ENDLINE_OUT_QTY) AS DEFECT_QTY
FROM qc_endline_output a
LEFT JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE
INNER JOIN item_part g ON a.ENDLINE_PART_CODE = g.PART_CODE
LEFT JOIN item_siteline c ON a.ENDLINE_ID_SITELINE = c.ID_SITELINE 
LEFT JOIN weekly_prod_sch_detail d ON d.SCHD_ID = a.ENDLINE_ACT_SCHD_ID
LEFT JOIN weekly_prod_schedule e	ON e.SCH_ID = d.SCH_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = e.SCH_CAPACITY_ID
WHERE 
DATE(a.ENDLINE_ADD_TIME) = :schDate AND
a.ENDLINE_OUT_TYPE = 'DEFECT' AND 
a.ENDLINE_OUT_UNDO IS NULL `;

//query site dash ###########################################################################

export const QuerySiteDashNow = `SELECT	
I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.CUS_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.FOREMAN, I.SCHD_DAYS_NUMBER, 
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE,
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION, 
I.PLAN_SEW_SMV, 
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
gl.SHIFT_START_HOUR STARTH, gl.SHIFT_END_HOUR ENDH, (I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE TPPM_NORMAL,
FIND_RTT(gl.SHIFT_START_HOUR, gl.SHIFT_END_HOUR, :schDate, I.ACT_TARGET, 	 ((I.ACT_TARGET/I.PLAN_WH)*I.WH_PERCENTAGE), :shift) RTT,
FIND_RTT_OT(gl.SHIFT_END_HOUR, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_OT MINUTE), :schDate, ACT_TARGET_OT, ACT_TARGET_OT/PLAN_WH_OT) RTT_OT, 
FIND_RTT_OT(gl.SHIFT_HOURLY_OT2, DATE_ADD(gl.SHIFT_END_HOUR, INTERVAL I.PLAN_WH_X_OT MINUTE), :schDate, ACT_TARGET_X_OT, ACT_TARGET_X_OT/PLAN_WH_X_OT) RTT_X_OT,
I.TOTAL_OUTPUT
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.CUS_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER, 
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM, h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE, h.FOREMAN,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION, 
        h.PLAN_SEW_SMV,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        -- IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
        h.ACT_TARGET,
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT, h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        h.ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        IFNULL(h.TOTAL_OUTPUT, 0) TOTAL_OUTPUT,  -- actual ouput
        h.WH_PERCENTAGE
        FROM(
					SELECT a.*, (a.PLAN_WH/ f.PLAN_WH) WH_PERCENTAGE , a.CUSTOMER_NAME CUSTOMER_PROGRAM, b.CUS_NAME, b.FOREMAN
					FROM log_daily_output a 
					LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ID_SITELINE
					LEFT JOIN 	(
					       -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
					       SELECT DISTINCT  a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, b.START_TIME, b.END_TIME,
					        a.PLAN_WH, a.PLAN_MP
					       FROM manpower_detail a 
					       LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
					       WHERE a.MP_DATE = :schDate   AND b.SHIFT = :shift -- AND b.ID_SITELINE = 'SLD0000001' AND b.SITE_NAME = :sitename
					       ORDER by a.ID_SITELINE
					) f ON f.LINE_NAME = a.LINE_NAME AND a.SITE_NAME = f.SITE_NAME
					WHERE a.SCHD_PROD_DATE = CURDATE() AND a.SHIFT = :shift AND a.SITE_NAME = :sitename
        )h
    ) I LEFT JOIN item_working_shift gl ON gl.SHIFT_ID = :shift AND INSTR(gl.SHIFT_DAYS, DAYNAME(:schDate)) > 1`;

export const QuerySiteDashPast = `SELECT 
a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.ID_SITELINE,  a.SITE_NAME, f.CUS_NAME, a.LINE_NAME, a.SHIFT, 
IF(SUBSTRING(a.SHIFT ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
a.ORDER_REFERENCE_PO_NO, a.SCHD_DAYS_NUMBER, 
a.ORDER_NO, a.CUSTOMER_NAME, a.CUSTOMER_NAME CUSTOMER_PROGRAM, a.PRODUCT_ITEM_CODE,
a.ITEM_COLOR_CODE,  a.ITEM_COLOR_NAME, a.ORDER_STYLE_DESCRIPTION, 
a.PLAN_SEW_SMV, a.FT_NORMAL, a.LT_NORMAL, a.FT_OT, a.LT_OT,  a.FT_X_OT, a.LT_X_OT,
a.PLAN_MP, a.PLAN_WH, a.ACT_MP, a.PLAN_TARGET, 	a.ACT_TARGET, a.PLAN_WH_X_OT,
a.PLAN_MP_OT, a.PLAN_WH_OT,  a.ACT_MP_OT, 
a.PLAN_TARGET_OT, a.ACT_TARGET_OT,
a.ACT_MP_X_OT, a.ACT_TARGET_X_OT,
gl.SHIFT_START_HOUR STARTH, gl.SHIFT_END_HOUR ENDH, (a.ACT_TARGET/a.PLAN_WH) TPPM_NORMAL,
a.TOTAL_TARGET,
a.ACT_TARGET RTT,
a.ACT_TARGET_OT RTT_OT,
a.ACT_TARGET_X_OT RTT_X_OT,
a.NORMAL_OUTPUT,  a.OT_OUTPUT, a.X_OT_OUTPUT, a.TOTAL_OUTPUT,  
a.PLAN_EH, a.PLAN_AH, a.PLAN_EH_OT, a.PLAN_AH_OT,  a.PLAN_EH_X_OT, a.PLAN_AH_X_OT,
a.ACT_WH, a.ACT_WH_OT, a.ACT_WH_X_OT, a.ACTUAL_EH, 
IFNULL(a.PLAN_AH,0) ACTUAL_AH,
a.ACTUAL_EH_OT, 
IFNULL(a.PLAN_AH_OT,0) ACTUAL_AH_OT,
-- IF(a.ACTUAL_AH_OT < PLAN_AH_OT, PLAN_AH_OT, ACTUAL_AH_OT) ACTUAL_AH_OT, 
a.ACTUAL_EH_X_OT,
IFNULL(a.PLAN_AH_X_OT,0) ACTUAL_AH_X_OT,
-- IF(a.ACTUAL_AH_X_OT < PLAN_AH_X_OT, PLAN_AH_X_OT, ACTUAL_AH_X_OT)ACTUAL_AH_X_OT,
a.EFF_NORMAL,
a.EFF_OT,
a.EFF_X_OT,
a.SCHD_DAYS_NUMBER, a.CUSTOMER_NAME,  a.ORDER_REFERENCE_PO_NO, 
a.PRODUCT_ITEM_CODE, a.ORDER_STYLE_DESCRIPTION, a.ITEM_COLOR_CODE, a.ITEM_COLOR_NAME
FROM log_daily_output a
LEFT JOIN (
    SELECT DISTINCT a.SITE_NAME, a.CUS_NAME, a.SHIFT
    FROM item_siteline a 
    WHERE a.SITE_NAME = :sitename
    GROUP BY a.SITE_NAME 
) f ON f.SITE_NAME = a.SITE_NAME
LEFT JOIN item_working_shift gl ON gl.SHIFT_ID = a.SHIFT AND INSTR(gl.SHIFT_DAYS, DAYNAME(:schDate)) > 1 
WHERE a.SCHD_PROD_DATE =:schDate AND a.SITE_NAME = :sitename -- AND a.SHIFT = :shift
ORDER BY a.ID_SITELINE`;

export const QueryDefRateSite = `SELECT a.ENDLINE_SCHD_DATE, a.ENDLINE_ID_SITELINE, e.SITE_NAME, e.SHIFT, d.CUSTOMER_NAME,
SUM(a.CHECKED) AS CHECKED, 
SUM(a.RTT)+SUM(a.REPAIRED) AS GOOD, 
SUM(a.RTT) RFT,
SUM(a.DEFECT) AS DEFECT, 
SUM(a.REPAIRED) AS REPAIRED
FROM  (
	SELECT 
   a.ENDLINE_ID_SITELINE,
   a.ENDLINE_ACT_SCHD_ID,
   a.ENDLINE_SCHD_DATE,
   SUM(CASE WHEN a.ENDLINE_OUT_QTY  THEN a.ENDLINE_OUT_QTY ELSE 0 END)  AS CHECKED,
   SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'RTT'  THEN a.ENDLINE_OUT_QTY ELSE 0 END)  AS RTT,
   SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'DEFECT'  AND a.ENDLINE_REPAIR = 'Y'  THEN a.ENDLINE_OUT_QTY ELSE 0 END) AS REPAIRED,
   SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'DEFECT'  THEN a.ENDLINE_OUT_QTY ELSE 0 END) AS DEFECT
	FROM qc_endline_output a
	WHERE  IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND  a.ENDLINE_SCHD_DATE = :schDate
	GROUP BY a.ENDLINE_ID_SITELINE, a.ENDLINE_ACT_SCHD_ID
) a
LEFT JOIN weekly_prod_sch_detail b ON a.ENDLINE_ACT_SCHD_ID = b.SCHD_ID
LEFT JOIN weekly_prod_schedule c ON b.SCH_ID = c.SCH_ID
LEFT JOIN viewcapacity d ON c.SCH_CAPACITY_ID = d.ID_CAPACITY
LEFT JOIN item_siteline e ON e.ID_SITELINE = a.ENDLINE_ID_SITELINE
WHERE a.ENDLINE_SCHD_DATE = :schDate AND b.SCHD_SITE = :sitename
GROUP BY  a.ENDLINE_SCHD_DATE, a.ENDLINE_ID_SITELINE, e.SITE_NAME, d.CUSTOMER_NAME`;

export const SQLTopDefectLine = `SELECT  
                              a.ENDLINE_SCHD_DATE AS SCHEDULE_DATE,
                                a.ENDLINE_ID_SITELINE AS SITELINE,
                                c.SITE_NAME AS SITE,
                                c.LINE_NAME AS LINE,
                                c.CUS_NAME,
                                a.ENDLINE_DEFECT_CODE AS DEFECT_CODE,
                                b.DEFECT_NAME AS DEFECT_NAME,
                                SUM(a.ENDLINE_OUT_QTY) AS DEFECT_QTY
                              FROM qc_endline_output a
                              INNER JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE
                              INNER JOIN item_siteline c ON a.ENDLINE_ID_SITELINE = c.ID_SITELINE
                              WHERE 
                                DATE(a.ENDLINE_ADD_TIME) = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteline
                              GROUP BY a.ENDLINE_ID_SITELINE, a.ENDLINE_DEFECT_CODE
                              ORDER BY SUM(a.ENDLINE_OUT_QTY) DESC LIMIT 3`;

export const SQLTopPartLine = ` SELECT  
                              a.ENDLINE_SCHD_DATE AS SCHEDULE_DATE,
                                a.ENDLINE_ID_SITELINE AS SITELINE,
                                c.SITE_NAME AS SITE,
                                c.LINE_NAME AS LINE,
                                c.SHIFT AS SHIFT,
                                c.CUS_NAME,
                                a.ENDLINE_DEFECT_CODE AS DEFECT_CODE,
                                b.DEFECT_NAME AS DEFECT_NAME,
                                a.ENDLINE_PART_CODE AS PART_CODE,
                                d.PART_NAME,
                                SUM(a.ENDLINE_OUT_QTY) AS DEFECT_QTY
                              FROM qc_endline_output a
                              INNER JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE
                              INNER JOIN item_siteline c ON a.ENDLINE_ID_SITELINE = c.ID_SITELINE
                              INNER JOIN item_part d ON a.ENDLINE_PART_CODE = d.PART_CODE
                              WHERE 
                              a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteline
                              GROUP BY a.ENDLINE_PART_CODE
                              ORDER BY SUM(a.ENDLINE_OUT_QTY) DESC LIMIT 3`;

// -- QC DASHBOARD CHECK PER HOUR
export const QueryQcRftPerHiour = `SELECT 
n.SHIFT_ID, n.JAM, n.START_HOUR, n.END_HOUR, n.CHECKED, (n.RFT+n.REPAIRED) GOOD,  n.RFT, n.DEFECT, n.REPAIRED,
ROUND(n.RFT/n.CHECKED*100,2) RFT_RATE,
ROUND(n.DEFECT/n.CHECKED*100,2) DEF_RATE
FROM(
	SELECT a.SHIFT_ID, a.JAM, a.START_HOUR, a.END_HOUR,
		SUM(c.RTT) AS RFT,
		SUM(c.DEFECT) AS DEFECT,
		SUM(c.REPAIRED) AS REPAIRED, 
		SUM(c.BS) AS BS,
		SUM(c.RTT)+SUM(c.DEFECT)+SUM(c.BS) AS CHECKED
	FROM view_item_wrk_shift_col a
	LEFT JOIN ( 
		SELECT a.ENDLINE_SCHD_DATE, a.ENDLINE_ID_SITELINE,  a.ENDLINE_ACT_SCHD_ID,  TIME(a.ENDLINE_ADD_TIME) ENDLINE_TIME, a.ENDLINE_PLAN_SIZE, a.ENDLINE_OUT_QTY RTT, 0 DEFECT, 0 REPAIRED, 0 BS  
		FROM   qc_endline_output a
		WHERE  a.ENDLINE_OUT_TYPE = 'RTT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND  DATE(a.ENDLINE_ADD_TIME) = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteLine
		UNION ALL 
		SELECT a.ENDLINE_SCHD_DATE,  a.ENDLINE_ID_SITELINE,  a.ENDLINE_ACT_SCHD_ID,  TIME(a.ENDLINE_ADD_TIME) ENDLINE_TIME, a.ENDLINE_PLAN_SIZE, 0 RTT, a.ENDLINE_OUT_QTY DEFECT, 0 REPAIRED, 0 BS  
		FROM   qc_endline_output a
		WHERE a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND  DATE(a.ENDLINE_ADD_TIME) = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteLine  -- AND a.ENDLINE_REPAIR IS NULL
		UNION ALL
		SELECT a.ENDLINE_SCHD_DATE,  a.ENDLINE_ID_SITELINE,  a.ENDLINE_ACT_SCHD_ID,  HOUR(a.ENDLINE_ADD_TIME) ENDLINE_TIME, a.ENDLINE_PLAN_SIZE, 0 RTT, 0 DEFECT, 0 REPAIRED, a.ENDLINE_OUT_QTY BS  
		FROM   qc_endline_output a
		WHERE a.ENDLINE_OUT_TYPE = 'BS' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND  DATE(a.ENDLINE_ADD_TIME) = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteLine
		UNION ALL
		SELECT DATE(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE,  a.ENDLINE_ID_SITELINE,  a.ENDLINE_ACT_SCHD_ID,  TIME(a.ENDLINE_MOD_TIME) ENDLINE_TIME, a.ENDLINE_PLAN_SIZE, 0 RTT, 0 DEFECT, a.ENDLINE_OUT_QTY REPAIRED, 0 BS  
		FROM   qc_endline_output a
		WHERE a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND a.ENDLINE_REPAIR = 'Y' AND  DATE(a.ENDLINE_MOD_TIME) = :schDate AND a.ENDLINE_ID_SITELINE = :idSiteLine
	) 	c ON 
		c.ENDLINE_TIME >= a.START_HOUR AND 
		c.ENDLINE_TIME < a.END_HOUR
	WHERE a.SHIFT_ID = :shift  AND INSTR(a.SHIFT_DAYS, DAYNAME (:schDate)) > 1 
	GROUP BY c.ENDLINE_SCHD_DATE, c.ENDLINE_ID_SITELINE, a.JAM
	ORDER BY a.JAM
) n`;
