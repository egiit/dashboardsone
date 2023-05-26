export const QueryEffCurDate = `SELECT	
I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.FOREMAN, I.SCHD_DAYS_NUMBER, 
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE,
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION, 
I.PLAN_SEW_SMV, I.FT_NORMAL, I.LT_NORMAL, I.FT_OT, I.LT_OT,  I.FT_X_OT, I.LT_X_OT,
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
I.NORMAL_OUTPUT,  I.OT_OUTPUT, I.X_OT_OUTPUT, I.TOTAL_OUTPUT,  
I.PLAN_EH, I.PLAN_AH, I.PLAN_EH_OT, I.PLAN_AH_OT,  I.PLAN_EH_X_OT, I.PLAN_AH_X_OT,
I.ACT_WH, I.ACT_WH_OT, I.ACT_WH_X_OT, I.ACTUAL_EH, I.ACTUAL_AH, 
I.ACTUAL_EH_OT, IF(I.ACTUAL_AH_OT < PLAN_AH_OT, PLAN_AH_OT, ACTUAL_AH_OT) ACTUAL_AH_OT, 
I.ACTUAL_EH_X_OT,IF(I.ACTUAL_AH_X_OT < PLAN_AH_X_OT, PLAN_AH_X_OT, ACTUAL_AH_X_OT)ACTUAL_AH_X_OT,
ROUND(NULLIF(I.ACTUAL_EH/I.ACTUAL_AH,0)*100,2) EFF_NORMAL,
ROUND(NULLIF(I.ACTUAL_EH_OT/IF(I.ACTUAL_AH_OT < PLAN_AH_OT, PLAN_AH_OT, ACTUAL_AH_OT),0)*100,2) EFF_OT,
ROUND(NULLIF(I.ACTUAL_EH_X_OT/IF(I.ACTUAL_AH_X_OT < PLAN_AH_X_OT, PLAN_AH_X_OT, ACTUAL_AH_X_OT) ,0)*100,2) EFF_X_OT
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.FOREMAN, h.SCHD_DAYS_NUMBER, 
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM, h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION, 
        h.PLAN_SEW_SMV, h.FT_NORMAL,  h.LT_NORMAL, h.FT_OT, h.LT_OT,  h.FT_X_OT, h.LT_X_OT,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        h.NORMAL_OUTPUT,  h.OT_OUTPUT, h.X_OT_OUTPUT,
        IFNULL(h.NORMAL_OUTPUT,0)+IFNULL(h.OT_OUTPUT,0)+IFNULL(X_OT_OUTPUT,0) TOTAL_OUTPUT,  -- actual ouput
        (h.ACT_TARGET*h.PLAN_SEW_SMV) PLAN_EH, (h.ACT_MP*h.PLAN_WH) PLAN_AH, -- plan EH and AH Actual target Normal
        (h.ACT_TARGET_OT*h.PLAN_SEW_SMV) PLAN_EH_OT, (h.ACT_MP_OT*h.PLAN_WH_OT) PLAN_AH_OT, -- plan EH and AH Actual target OT
        (h.ACT_TARGET_X_OT*h.PLAN_SEW_SMV) PLAN_EH_X_OT, (h.ACT_MP_X_OT*h.PLAN_WH_X_OT) PLAN_AH_X_OT, 
        CASE WHEN h.ACT_WH > h.PLAN_WH THEN h.PLAN_WH ELSE h.ACT_WH END AS ACT_WH,
        CASE WHEN h.ACT_WH_OT BETWEEN h.PLAN_WH_OT-15 AND  h.PLAN_WH_OT+15 THEN h.PLAN_WH_OT ELSE h.ACT_WH_OT END AS ACT_WH_OT,
        h.ACT_WH_X_OT,
        (h.NORMAL_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH, (h.ACT_MP*h.ACT_WH) ACTUAL_AH,
        (h.OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_OT, (h.ACT_MP_OT*h.ACT_WH_OT) ACTUAL_AH_OT,
        (h.X_OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_X_OT, (h.ACT_MP_X_OT*h.ACT_WH_X_OT)  ACTUAL_AH_X_OT
        FROM(
        SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
                n.ORDER_REFERENCE_PO_NO, n.FOREMAN, n.SCHD_DAYS_NUMBER, 
                n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE, 
                n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,  
                n.SEQ_NORMAL, n.SEQ_OT,	n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP, 
                n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
                n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
                n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT, 
                n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
                n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
                n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
                n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
                n.NORMAL_OUTPUT, n.OT_OUTPUT, n.X_OT_OUTPUT, n.FT_NORMAL, n.LT_NORMAL,
                -- TIMEDIFF(n.LT_NORMAL, n.FT_NORMAL) TTL_TNORMAL,
                n.FT_OT, n.LT_OT, n.FT_X_OT, LT_X_OT,
            -- 	TIMEDIFF(n.LT_OT, n.FT_OT) TTL_TOT
                FIND_WH(:shift,  :schDate , n.FT_NORMAL, n.LT_NORMAL) ACT_WH,
                -- ACTUAL WH OT JIKA OVERTIME LEBIH DARI 4JAM MAKA KURANGI SATU JAM ISTIRAHAT
                IF(TIMEDIFF(n.LT_OT,  n.FT_OT) >= TIME('04:00:00'),time_to_sec(TIMEDIFF(n.LT_OT,  n.FT_OT))/60-60, time_to_sec(TIMEDIFF(n.LT_OT,  n.FT_OT))/60)  ACT_WH_OT,
                time_to_sec(TIMEDIFF(n.LT_X_OT,  n.FT_X_OT))/60  ACT_WH_X_OT
            FROM (
                    SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.SCHD_ID_SITELINE ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT, 
                    IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
                    b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
                    b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
                    b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,  
                    FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
                    CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP, 
                    CASE WHEN ISNULL(f.PLAN_WH) THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH, 
                    m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP, m.ACT_MP_OT, m.ACT_MP_X_OT, p.NORMAL_OUTPUT, p.OT_OUTPUT, p.X_OT_OUTPUT,
                    l.SEQ_NORMAL, l.SEQ_OT, IF(l.SEQ_NORMAL = 1, e.START_TIME, l.FIRST_TIME_NORMAL) AS FT_NORMAL, 
                    l.LAST_TIME_NORMAL LT_NORMAL,  IF(l.SEQ_OT = 1, k.SHIFT_END_HOUR, l.FIRST_TIME_OT) AS FT_OT, 
                    l.LAST_TIME_OT LT_OT, IF(l.SEQ_X_OT = 1, l.LAST_TIME_OT, l.FIRST_TIME_X_OT) AS FT_X_OT,
                    l.LAST_TIME_X_OT LT_X_OT
                     -- CASE WHEN l.SEQ_NORMAL = 1 THEN d.START_TIME 
                    FROM weekly_prod_sch_detail a
                    LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
                    LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
                    --	untuk aktual SMV
                    LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
                    LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
                    LEFT JOIN 	(
                            -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
                            SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, b.START_TIME, b.END_TIME,
                             a.PLAN_WH, a.PLAN_MP
                            FROM manpower_detail a 
                            LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
                            WHERE a.MP_DATE = :schDate   AND b.SHIFT = :shift -- AND b.ID_SITELINE = 'SLD0000001' AND b.SITE_NAME = :sitename
                            ORDER by a.ID_SITELINE
                    ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
                    -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
                    LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
                    LEFT JOIN (
                        SELECT DISTINCT a.SCHD_ID, a.LINE_NAME, a.SHIFT, a.PLAN_MP, a.ACT_MP, a.PLAN_MP_OT, a.ACT_MP_OT, a.PLAN_MP_X_OT, a.ACT_MP_X_OT 
                        FROM   mp_daily_detail a  WHERE a.SHIFT = :shift AND DATE(a.CREATE_DATE) = :schDate
                        GROUP BY a.SCHD_ID, a.LINE_NAME, a.SHIFT
                    ) m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift 
                    -- left join ciew qcendlineoutput untuk mendapatkan output
                    LEFT JOIN (
                             SELECT a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCHD_DATE, a.ENDLINE_ID_SITELINE, a.NORMAL_OUTPUT, a.OT_OUTPUT, a.X_OT_OUTPUT
                             FROM qcendlineoutput a 
                             LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                             WHERE a.ENDLINE_SCHD_DATE = :schDate AND b.SHIFT = :shift -- AND a.ENDLINE_ID_SITELINE =  'SLD0000001'
                    ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
                    LEFT JOIN out_prod_time_view l ON l.ENDLINE_ACT_SCHD_ID = a.SCHD_ID AND l.ENDLINE_ID_SITELINE = e.ID_SITELINE AND l.ENDLINE_SCHD_DATE = :schDate
                    LEFT JOIN item_working_shift k ON k.SHIFT_ID  = :shift AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate)) > 1 
                    WHERE a.SCHD_PROD_DATE = :schDate  AND  e.SHIFT = :shift AND d.SITE_NAME = :sitename -- AND e.MP_DATE = :schDate-- AND d.SITE_NAME = :sitename AND d.LINE_NAME = 'LINE-01'
            )n
        )h
    ) I ORDER BY I.ID_SITELINE`;

export const QueryEffFromLog = `SELECT 
a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.ID_SITELINE,  a.SITE_NAME, a.LINE_NAME, a.SHIFT, 
IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
a.PLAN_SEW_SMV, a.FT_NORMAL, a.LT_NORMAL, a.FT_OT, a.LT_OT,  a.FT_X_OT, a.LT_X_OT,
a.PLAN_MP, a.PLAN_WH, a.ACT_MP, a.PLAN_TARGET, 	a.ACT_TARGET,
a.PLAN_MP_OT, a.PLAN_WH_OT,  a.ACT_MP_OT, 
a.PLAN_TARGET_OT, a.ACT_TARGET_OT,
a.ACT_MP_X_OT, a.ACT_TARGET_X_OT,
a.TOTAL_TARGET,
a.NORMAL_OUTPUT,  a.OT_OUTPUT, a.X_OT_OUTPUT, a.TOTAL_OUTPUT,  
a.PLAN_EH, a.PLAN_AH, a.PLAN_EH_OT, a.PLAN_AH_OT,  a.PLAN_EH_X_OT, a.PLAN_AH_X_OT,
a.ACT_WH, a.ACT_WH_OT, a.ACT_WH_X_OT, a.ACTUAL_EH, a.ACTUAL_AH, 
a.ACTUAL_EH_OT, IF(a.ACTUAL_AH_OT < PLAN_AH_OT, PLAN_AH_OT, ACTUAL_AH_OT) ACTUAL_AH_OT, 
a.ACTUAL_EH_X_OT,IF(a.ACTUAL_AH_X_OT < PLAN_AH_X_OT, PLAN_AH_X_OT, ACTUAL_AH_X_OT)ACTUAL_AH_X_OT,
a.EFF_NORMAL,
a.EFF_OT,
a.EFF_X_OT,
b.SCHD_DAYS_NUMBER, c.CUSTOMER_NAME, c.CUSTOMER_NAME, c.ORDER_REFERENCE_PO_NO, 
c.PRODUCT_ITEM_CODE, c.ORDER_STYLE_DESCRIPTION, c.ITEM_COLOR_CODE, c.ITEM_COLOR_NAME
FROM log_daily_output a
LEFT JOIN weekly_prod_sch_detail b ON a.SCHD_ID = b.SCHD_ID 
LEFT JOIN viewcapacity c ON c.ID_CAPACITY = b.SCHD_CAPACITY_ID
WHERE a.SCHD_PROD_DATE =:schDate AND a.SITE_NAME = :sitename AND a.SHIFT = :shift
ORDER BY a.ID_SITELINE`;
