export const QueryQcDash = (params) => {
  if (!params) return false;

  return `SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE, h.SITE_NAME, h.CUS_NAME, h.LINE_NAME, h.SHIFT, h.ORDER_REFERENCE_PO_NO, 
    h.ORDER_NO, h.CUSTOMER_NAME, h.PRODUCT_ITEM_CODE, 
    h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION, 
    h.PLAN_TARGET, h.TOTAL_TARGET, 
    h.TOTAL_OUTPUT, h.CHECKED, (h.RFT+h.REPAIRED) AS GOOD, h.RFT, h.DEFECT, h.REPAIRED, h.BS 
    FROM(
        SELECT 
        a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.ID_SITELINE,  a.SITE_NAME,  c.CUS_NAME,  a.LINE_NAME, a.SHIFT,	a.ORDER_REFERENCE_PO_NO, 
         a.ORDER_NO, a.CUSTOMER_NAME, a.PRODUCT_ITEM_CODE, 
        a.ITEM_COLOR_CODE,  a.ITEM_COLOR_NAME, a.ORDER_STYLE_DESCRIPTION,
        a.ACT_TARGET PLAN_TARGET, IFNULL(a.TOTAL_TARGET,0) TOTAL_TARGET,
         a.TOTAL_OUTPUT, xs.CHECKED, IFNULL(xs.RTT,0) RFT, xs.DEFECT, IFNULL(xs.REPAIRED,0) REPAIRED, xs.BS -- , a.PLAN_REMARK
        FROM  log_daily_output a 
        LEFT JOIN log_endline_check xs ON xs.SCHD_ID = a.SCHD_ID AND a.ID_SITELINE = xs.ID_SITELINE
        LEFT JOIN item_siteline c ON c.ID_SITELINE = a.ID_SITELINE 
        WHERE ${params}  
        -- a.SCHD_PROD_DATE = CURDATE() -- AND a.SITE_NAME = 'SBR_01'
        AND (a.TOTAL_OUTPUT <> '0' OR a.TOTAL_TARGET <> '0.0') 
        GROUP BY  a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.ID_SITELINE,  a.SITE_NAME, a.LINE_NAME, a.SHIFT
        ORDER BY a.ID_SITELINE
    )h`;
};

export const QueryQcDefPart = (params) => {
  if (!params) return false;

  return `SELECT a.SCHD_PROD_DATE,
  b.ENDLINE_DEFECT_CODE AS DEFECT_CODE,
  SUBSTRING_INDEX(c.DEFECT_NAME,'(',1)  AS DEFECT_NAME,
  c.DEFECT_NAME AS FULL_NAME,
  b.ENDLINE_PART_CODE AS PART_CODE,
  d.PART_NAME,
  b.ENDLINE_OUT_QTY DEFECT_QTY
  FROM log_daily_output a 
  LEFT JOIN qc_endline_output b ON a.SCHD_ID = b.ENDLINE_ACT_SCHD_ID AND a.ID_SITELINE = b.ENDLINE_ID_SITELINE
  LEFT JOIN item_defect_internal c ON b.ENDLINE_DEFECT_CODE = c.DEFECT_SEW_CODE
  LEFT JOIN item_part d ON d.PART_CODE = b.ENDLINE_PART_CODE
  WHERE  b.ENDLINE_OUT_TYPE = 'DEFECT'AND b.ENDLINE_OUT_UNDO IS NULL 
  AND  ${params} 
  `;
};

export const SQLTopDefectLineYes = `SELECT n.* FROM 
(
  SELECT  
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
  WHERE DATE(a.ENDLINE_ADD_TIME) = (
    SELECT DISTINCT a.SCHD_PROD_DATE
    FROM log_daily_output a 
    WHERE a.SCHD_PROD_DATE < :schDate AND a.ID_SITELINE = :idSiteline
    AND (a.TOTAL_OUTPUT <> '0' OR a.TOTAL_TARGET <> '0.0') 
    ORDER BY a.SCHD_PROD_DATE DESC LIMIT 1
  ) 
  AND a.ENDLINE_ID_SITELINE = :idSiteline
  GROUP BY a.ENDLINE_ID_SITELINE, a.ENDLINE_DEFECT_CODE
  ORDER BY a.ENDLINE_ADD_TIME
) n ORDER BY n.DEFECT_QTY DESC LIMIT 3 `;

export const SQLTopPartLineYes = `
SELECT n.* FROM (
  SELECT  
  a.ENDLINE_SCHD_DATE AS SCHEDULE_DATE,
    a.ENDLINE_ID_SITELINE AS SITELINE,
    c.SITE_NAME AS SITE,
    c.LINE_NAME AS LINE,
    c.SHIFT AS SHIFT,
    c.CUS_NAME,
    a.ENDLINE_PART_CODE AS PART_CODE,
    b.PART_NAME,
    SUM(a.ENDLINE_OUT_QTY) AS DEFECT_QTY
  FROM qc_endline_output a
  INNER JOIN item_part b ON a.ENDLINE_PART_CODE = b.PART_CODE
  INNER JOIN item_siteline c ON a.ENDLINE_ID_SITELINE = c.ID_SITELINE
  WHERE DATE(a.ENDLINE_ADD_TIME) = (
    SELECT DISTINCT a.SCHD_PROD_DATE
    FROM log_daily_output a 
    WHERE a.SCHD_PROD_DATE < :schDate AND a.ID_SITELINE = :idSiteline
    AND (a.TOTAL_OUTPUT <> '0' OR a.TOTAL_TARGET <> '0.0') 
    ORDER BY a.SCHD_PROD_DATE DESC LIMIT 1
  ) 
  AND a.ENDLINE_ID_SITELINE = :idSiteline
  GROUP BY a.ENDLINE_ID_SITELINE, a.ENDLINE_PART_CODE
  ORDER BY  a.ENDLINE_ADD_TIME
) n ORDER BY n.DEFECT_QTY DESC LIMIT 3
  `;
