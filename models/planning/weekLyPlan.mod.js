import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const QueryCapacity = `SELECT a.PRODUCTION_MONTH, a.MANUFACTURING_SITE, a.CUSTOMER_NAME,a.CUSTOMER_DIVISION, a.CUSTOMER_PROGRAM,
a.CUSTOMER_SEASON, a.ORDER_NO, a.ORDER_REFERENCE_PO_NO, a.PRODUCT_ITEM_CODE, a.PRODUCT_ITEM_DESCRIPTION, a.ORDER_STYLE_DESCRIPTION,
a.ITEM_COLOR_CODE, a.ITEM_COLOR_NAME, a.MO_NO, a.TARGET_PCD, a.PLAN_EXFACTORY_DATE, a.FINAL_DELIVERY_DATE,
a.NEW_TARGET_PCD, a.NEW_PLAN_EXFACTORY_DATE,  a.NEW_FINAL_DELIVERY_DATE, 
a.MO_QTY, a.ORDER_QTY, n.SCH_QTY, (a.ORDER_QTY-n.SCH_QTY) VAR_QTY, a.ID_CAPACITY, a.PROD_MONTH
FROM viewcapacity a 
LEFT JOIN (
	SELECT a.SCH_CAPACITY_ID, SUM(a.SCH_QTY) SCH_QTY
	FROM weekly_prod_schedule a  
	WHERE a.SCH_PROD_MONTH BETWEEN  :startMonth AND :endMonth
	GROUP BY a.SCH_CAPACITY_ID
	) n ON a.ID_CAPACITY = n.SCH_CAPACITY_ID
WHERE a.PROD_MONTH BETWEEN :startMonth AND :endMonth
ORDER BY a.PROD_MONTH, a.MANUFACTURING_SITE, a.CUSTOMER_NAME, a.CUSTOMER_DIVISION, a.ORDER_REFERENCE_PO_NO, a.PRODUCT_ITEM_CODE, a.PLAN_EXFACTORY_DATE`;

export const QueryOneCapacity = `SELECT a.PRODUCTION_MONTH, a.MANUFACTURING_SITE, a.CUSTOMER_NAME,a.CUSTOMER_DIVISION, a.CUSTOMER_PROGRAM,
a.CUSTOMER_SEASON, a.ORDER_NO, a.ORDER_REFERENCE_PO_NO, a.PRODUCT_ITEM_CODE, a.PRODUCT_ITEM_DESCRIPTION, a.ORDER_STYLE_DESCRIPTION,
a.ITEM_COLOR_CODE, a.ITEM_COLOR_NAME, a.MO_NO, a.TARGET_PCD, a.PLAN_EXFACTORY_DATE, a.FINAL_DELIVERY_DATE,
a.NEW_TARGET_PCD, a.NEW_PLAN_EXFACTORY_DATE,  a.NEW_FINAL_DELIVERY_DATE, 
a.MO_QTY, a.ORDER_QTY, n.SCH_QTY, (a.ORDER_QTY-n.SCH_QTY) VAR_QTY, a.ID_CAPACITY, a.PROD_MONTH
FROM viewcapacity a 
LEFT JOIN (
	SELECT a.SCH_CAPACITY_ID, SUM(a.SCH_QTY) SCH_QTY
	FROM weekly_prod_schedule a  
	WHERE a.SCH_CAPACITY_ID = :capId
	GROUP BY a.SCH_CAPACITY_ID
	) n ON a.ID_CAPACITY = n.SCH_CAPACITY_ID
WHERE  a.ID_CAPACITY = :capId 
ORDER BY a.PROD_MONTH, a.MANUFACTURING_SITE, a.CUSTOMER_NAME, a.CUSTOMER_DIVISION, a.ORDER_REFERENCE_PO_NO, a.PRODUCT_ITEM_CODE, a.PLAN_EXFACTORY_DATE`;

export const QueryGetHeadWeekSch = `SELECT a.SCH_ID, b.PROD_MONTH, CASE WHEN ISNULL(a.SCH_START_PROD) THEN b.PRODUCTION_MONTH ELSE DATE_FORMAT(a.SCH_START_PROD,'%M/%Y') END ACTUAL_MONTH,
b.PRODUCTION_MONTH, b.MANUFACTURING_SITE,  a.SCH_SITE, a.SCH_ID_SITELINE, c.LINE_NAME, b.CUSTOMER_NAME, a.SCH_CAPACITY_ID,
a.SCH_QTY, b.MO_QTY, b.ORDER_REFERENCE_PO_NO, b.PRODUCT_ITEM_CODE, b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, b.ITEM_COLOR_NAME, b.ITEM_COLOR_CODE, b.TARGET_PCD, b.PLAN_EXFACTORY_DATE,
b.FINAL_DELIVERY_DATE, a.SCH_START_PROD, a.SCH_FINISH_PROD, a.SCH_ORDER,
b.NEW_TARGET_PCD, b.NEW_PLAN_EXFACTORY_DATE,  b.NEW_FINAL_DELIVERY_DATE
FROM weekly_prod_schedule a  
LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
WHERE a.SCH_SITE = :site AND a.SCH_ID IN  (
  SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
) OR IFNULL(a.SCH_START_PROD ,'') =  ''
ORDER BY a.SCH_ID_SITELINE, a.SCH_START_PROD ASC`;

export const QueryGetHeadWeekSchOne = `SELECT a.SCH_ID, b.PROD_MONTH, CASE WHEN ISNULL(a.SCH_START_PROD) THEN b.PRODUCTION_MONTH ELSE DATE_FORMAT(a.SCH_START_PROD,'%M/%Y') END ACTUAL_MONTH,
b.PRODUCTION_MONTH, b.MANUFACTURING_SITE,  a.SCH_SITE, a.SCH_ID_SITELINE, c.LINE_NAME, b.CUSTOMER_NAME, a.SCH_CAPACITY_ID,
a.SCH_QTY, b.MO_QTY, b.ORDER_REFERENCE_PO_NO, b.PRODUCT_ITEM_CODE, b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, b.ITEM_COLOR_NAME, b.TARGET_PCD, b.PLAN_EXFACTORY_DATE,
b.FINAL_DELIVERY_DATE, a.SCH_START_PROD, a.SCH_FINISH_PROD, a.SCH_ORDER,
b.NEW_TARGET_PCD, b.NEW_PLAN_EXFACTORY_DATE,  b.NEW_FINAL_DELIVERY_DATE
FROM weekly_prod_schedule a  
LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
WHERE a.SCH_ID = :schId`;

export const QueryGetDayliSch = `SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_MONTH, a.SCHD_PROD_DATE, a.SCHD_SITE, a.SCHD_ID_SITELINE,
a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, b.SCH_QTY SCHD_HEADER_QTY, a.SCHD_STATUS_OUTPUT,  a.SCHD_HEAD_BALANCE, a.SCHD_QTY
FROM weekly_prod_sch_detail a 
LEFT JOIN weekly_prod_schedule b ON a.SCH_ID = b.SCH_ID
WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate AND a.SCHD_SITE = :site  AND a.SCH_ID LIKE :schId 
ORDER BY a.SCHD_DAYS_NUMBER`;

export const QueryGetOneDayliSch = `SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_MONTH, a.SCHD_PROD_DATE, a.SCHD_SITE, a.SCHD_ID_SITELINE,
a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, b.SCH_QTY SCHD_HEADER_QTY,  a.SCHD_HEAD_BALANCE, a.SCHD_QTY, a.SCHD_STATUS_OUTPUT
FROM weekly_prod_sch_detail a 
LEFT JOIN weekly_prod_schedule b ON a.SCH_ID = b.SCH_ID
WHERE a.SCH_ID = :schId
ORDER BY a.SCHD_DAYS_NUMBER
`;

export const WeeklyProSchd = db.define(
  "weekly_prod_schedule",
  {
    SCH_ID: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    SCH_PROD_MONTH: { type: DataTypes.STRING },
    SCH_SITE: { type: DataTypes.STRING },
    SCH_ID_SITELINE: { type: DataTypes.STRING },
    SCH_CAPACITY_ID: { type: DataTypes.STRING },
    SCH_QTY: { type: DataTypes.INTEGER },
    SCH_DAYS_RUN: { type: DataTypes.INTEGER },
    SCH_ORDER: { type: DataTypes.INTEGER },
    SCH_START_PROD: { type: DataTypes.DATE },
    SCH_FINISH_PROD: { type: DataTypes.DATE },
    SCH_ADD_DATE: { type: DataTypes.DATE },
    SCH_MOD_DATE: { type: DataTypes.DATE },
    SCH_ADD_ID: { type: DataTypes.BIGINT },
    SCH_MOD_ID: { type: DataTypes.BIGINT },
  },
  {
    freezeTableName: true,
    createdAt: "SCH_ADD_DATE",
    updatedAt: "SCH_MOD_DATE",
  }
);

export const WeekSchDetail = db.define(
  "weekly_prod_sch_detail",
  {
    SCHD_ID: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    SCH_ID: { type: DataTypes.BIGINT },
    SCHD_PROD_MONTH: { type: DataTypes.STRING },
    SCHD_PROD_DATE: { type: DataTypes.DATEONLY },
    SCHD_SITE: { type: DataTypes.STRING },
    SCHD_ID_SITELINE: { type: DataTypes.STRING },
    SCHD_CAPACITY_ID: { type: DataTypes.STRING },
    SCHD_DAYS_NUMBER: { type: DataTypes.INTEGER },
    SCHD_HEADER_QTY: { type: DataTypes.INTEGER },
    SCHD_HEAD_BALANCE: { type: DataTypes.INTEGER },
    SCHD_QTY: { type: DataTypes.INTEGER },
    SCHD_STATUS_OUTPUT: { type: DataTypes.STRING },
    SCHD_ADD_DATE: { type: DataTypes.DATE },
    SCHD_MOD_DATE: { type: DataTypes.DATE },
    SCHD_ADD_ID: { type: DataTypes.BIGINT },
    SCHD_MOD_ID: { type: DataTypes.BIGINT },
  },
  {
    freezeTableName: true,
    createdAt: "SCHD_ADD_DATE",
    updatedAt: "SCHD_MOD_DATE",
  }
);

export const QueryGetGroupSch = `SELECT a.SCH_ID, b.PROD_MONTH, CASE WHEN ISNULL(a.SCH_START_PROD) THEN b.PRODUCTION_MONTH ELSE DATE_FORMAT(a.SCH_START_PROD,'%M/%Y') END ACTUAL_MONTH,
b.PRODUCTION_MONTH, b.MANUFACTURING_SITE,  a.SCH_SITE, a.SCH_ID_SITELINE, c.LINE_NAME, b.CUSTOMER_NAME, a.SCH_CAPACITY_ID,
a.SCH_QTY, b.MO_QTY, d.SCHD_QTY, b.ORDER_REFERENCE_PO_NO, b.PRODUCT_ITEM_CODE, b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, b.ITEM_COLOR_NAME, b.TARGET_PCD, b.PLAN_EXFACTORY_DATE,
b.FINAL_DELIVERY_DATE, a.SCH_START_PROD, a.SCH_FINISH_PROD, a.SCH_ORDER,
b.NEW_TARGET_PCD, b.NEW_PLAN_EXFACTORY_DATE,  b.NEW_FINAL_DELIVERY_DATE
FROM weekly_prod_schedule a  
LEFT JOIN (
	SELECT a.SCH_ID, sum(a.SCHD_QTY) SCHD_QTY
	FROM weekly_prod_sch_detail a WHERE a.SCHD_CAPACITY_ID = :capId
	GROUP BY a.SCH_ID
) d ON d.SCH_ID = a.SCH_ID
LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
WHERE  a.SCH_CAPACITY_ID = :capId `;

export const SchSizeAloc = db.define(
  "weekly_sch_size",
  {
    SCH_SIZE_ID: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    PDM_ID: { type: DataTypes.BIGINT },
    SCH_ID: { type: DataTypes.BIGINT },
    ID_CAPACITY: { type: DataTypes.STRING },
    SIZE_CODE: { type: DataTypes.STRING },
    PACKING_METHOD: { type: DataTypes.STRING },
    SCH_SIZE_QTY: { type: DataTypes.INTEGER },
    ADD_ID: { type: DataTypes.BIGINT },
    MOD_ID: { type: DataTypes.BIGINT },
    ADD_DATE: { type: DataTypes.DATE },
    MOD_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_DATE",
    updatedAt: "MOD_DATE",
  }
);

export const getSizeAlocForUpdtSch = `SELECT
nb.SCH_SIZE_ID, nb.SCH_ID, 
b.ID_CAPACITY, a.PDM_ID,  a.SITE_CODE, a.PROD_MONTH, a.BUYER_CODE, a.ORDER_NO, a.ORDER_REF_NO, a.ORDER_PO_STYLE_REF, 
a.COLOR_CODE, a.COLOR_NAME, a.EX_FACTORY, a.SIZE_CODE, a.PACKING_METHOD, nb.PACKING_METHOD SCH_METHOD, a.TOTAL_QTY,
na.SCH_SIZE_QTY SCH_QTY, 
CASE WHEN ISNULL(na.SCH_SIZE_QTY) THEN a.TOTAL_QTY ELSE a.TOTAL_QTY-na.SCH_SIZE_QTY END BALANCE, nb.SCH_SIZE_QTY NEW_SCH,
CASE WHEN ISNULL(na.SCH_SIZE_QTY) THEN a.TOTAL_QTY ELSE a.TOTAL_QTY-na.SCH_SIZE_QTY END - nb.SCH_SIZE_QTY NEW_BALANCE
FROM po_matrix_delivery a 
-- LEFT JOIN viewcapacity b ON a.SITE_CODE = b.MANUFACTURING_SITE AND a.PROD_MONTH = b.PRODUCTION_MONTH 
LEFT JOIN viewcapacity b ON a.PROD_MONTH = b.PRODUCTION_MONTH 
	AND a.SITE_CODE = b.MANUFACTURING_SITE 
	AND a.EX_FACTORY = IF(b.NEW_PLAN_EXFACTORY_DATE, b.NEW_PLAN_EXFACTORY_DATE,b.PLAN_EXFACTORY_DATE)  
	AND a.ORDER_NO = b.ORDER_NO 
 	AND a.COLOR_CODE = b.ITEM_COLOR_CODE
LEFT JOIN  (
  SELECT n.PDM_ID, n.ID_CAP_SIZE, n.ID_CAPACITY, n.SCH_ID, n.SCH_SIZE_ID, n.SIZE_CODE, 
	IF(o.NEW_PLAN_EXFACTORY_DATE, o.NEW_PLAN_EXFACTORY_DATE, o.PLAN_EXFACTORY_DATE) EX_FACTORY,
	n.PACKING_METHOD, sum(n.SCH_SIZE_QTY) SCH_SIZE_QTY
	FROM view_weekly_sch_size n
	LEFT JOIN weekly_prod_schedule m ON m.SCH_ID = n.SCH_ID
	LEFT JOIN viewcapacity o ON o.ID_CAPACITY = m.SCH_CAPACITY_ID
	WHERE n.ID_CAP_SIZE = CONCAT(SUBSTRING_INDEX( :capId,'.',5),'.', SUBSTRING_INDEX( :capId,'.',-1))
  AND n.SCH_ID <> :schId
	GROUP BY  n.SIZE_CODE, n.PACKING_METHOD
) na ON na.SIZE_CODE = a.SIZE_CODE AND na.PACKING_METHOD = a.PACKING_METHOD AND na.EX_FACTORY = IF(b.NEW_PLAN_EXFACTORY_DATE, b.NEW_PLAN_EXFACTORY_DATE,b.PLAN_EXFACTORY_DATE) 
LEFT JOIN  (
  SELECT n.PDM_ID, n.ID_CAP_SIZE, n.ID_CAPACITY, n.SCH_ID, n.SCH_SIZE_ID, n.SIZE_CODE, 
	IF(o.NEW_PLAN_EXFACTORY_DATE, o.NEW_PLAN_EXFACTORY_DATE, o.PLAN_EXFACTORY_DATE) EX_FACTORY,
	n.PACKING_METHOD, sum(n.SCH_SIZE_QTY) SCH_SIZE_QTY
	FROM view_weekly_sch_size n
	LEFT JOIN weekly_prod_schedule m ON m.SCH_ID = n.SCH_ID
	LEFT JOIN viewcapacity o ON o.ID_CAPACITY = m.SCH_CAPACITY_ID
	WHERE n.ID_CAP_SIZE = CONCAT(SUBSTRING_INDEX( :capId,'.',5),'.', SUBSTRING_INDEX( :capId,'.',-1))
  AND n.SCH_ID = :schId
	GROUP BY  n.SIZE_CODE, n.PACKING_METHOD
) nb ON nb.SIZE_CODE = a.SIZE_CODE AND nb.PACKING_METHOD = a.PACKING_METHOD AND nb.EX_FACTORY = IF(b.NEW_PLAN_EXFACTORY_DATE, b.NEW_PLAN_EXFACTORY_DATE,b.PLAN_EXFACTORY_DATE) 
WHERE b.ID_CAPACITY = :capId`;
// export const getSizeAlocForUpdtSch = `SELECT
// nb.SCH_SIZE_ID, nb.SCH_ID,
// b.ID_CAPACITY, a.PDM_ID, a.SITE_CODE, a.PROD_MONTH, a.BUYER_CODE, a.ORDER_NO, a.ORDER_REF_NO, a.ORDER_PO_STYLE_REF,
// a.COLOR_CODE, a.COLOR_NAME, a.EX_FACTORY, a.SIZE_CODE, a.TOTAL_QTY,
// na.SCH_SIZE_QTY SCH_QTY,
// CASE WHEN ISNULL(na.SCH_SIZE_QTY) THEN a.TOTAL_QTY ELSE a.TOTAL_QTY-na.SCH_SIZE_QTY END BALANCE, nb.SCH_SIZE_QTY NEW_SCH,
// CASE WHEN ISNULL(na.SCH_SIZE_QTY) THEN a.TOTAL_QTY ELSE a.TOTAL_QTY-na.SCH_SIZE_QTY END - nb.SCH_SIZE_QTY NEW_BALANCE
// FROM po_matrix_delivery a
// -- LEFT JOIN viewcapacity b ON a.SITE_CODE = b.MANUFACTURING_SITE AND a.PROD_MONTH = b.PRODUCTION_MONTH
// LEFT JOIN viewcapacity b ON a.PROD_MONTH = b.PRODUCTION_MONTH AND a.SITE_CODE = b.MANUFACTURING_SITE
// AND a.EX_FACTORY = IF(b.NEW_PLAN_EXFACTORY_DATE, b.NEW_PLAN_EXFACTORY_DATE,b.PLAN_EXFACTORY_DATE)  AND a.ORDER_NO = b.ORDER_NO
//  AND a.COLOR_CODE = b.ITEM_COLOR_CODE
// LEFT JOIN (
// 	SELECT  n.PDM_ID, n.SCH_ID, sum(n.SCH_SIZE_QTY) SCH_SIZE_QTY
// 	FROM weekly_sch_size n
// 	WHERE n.ID_CAPACITY = :capId AND n.SCH_ID <> :schId
// 	GROUP BY n.PDM_ID
// ) na ON na.PDM_ID  = a.PDM_ID
// LEFT JOIN (
// 	SELECT  n.PDM_ID, n.SCH_ID, n.SCH_SIZE_ID, sum(n.SCH_SIZE_QTY) SCH_SIZE_QTY
// 	FROM weekly_sch_size n
// 	WHERE n.ID_CAPACITY = :capId AND n.SCH_ID = :schId
// 	GROUP BY n.PDM_ID
// )nb ON nb.PDM_ID  = a.PDM_ID
// WHERE b.ID_CAPACITY = :capId`;

export const QryCheckOutput = `SELECT a.ENDLINE_SCHD_DATE, a.PLANSIZE_ID, a.ENDLINE_PLAN_SIZE, a.ENDLINE_SCHD_ID, a.ENDLINE_ACT_SCHD_ID
FROM qc_endline_output a
WHERE a.ENDLINE_ACT_SCHD_ID = :schdId`;

export const QryCronPvsA = `SELECT a.ID_SITELINE, b.SCH_ID, b.SCHD_ID, b.SCHD_PROD_DATE, b.SCHD_QTY, b.TOTAL_OUTPUT 
FROM item_line_running a 
LEFT JOIN scheduel_vs_actual b ON a.ID_SITELINE = b.SCHD_ID_SITELINE 
WHERE b.SCHD_PROD_DATE = '2023-07-07' AND a.ID_SITELINE = 'SLD0000077'`;
// export const QryCronPvsA = `SELECT a.ID_SITELINE, b.SCH_ID, b.SCHD_ID, b.SCHD_PROD_DATE, b.SCHD_QTY, b.TOTAL_OUTPUT
// FROM item_line_running a
// LEFT JOIN scheduel_vs_actual b ON a.ID_SITELINE = b.SCHD_ID_SITELINE
// WHERE b.SCHD_PROD_DATE = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
// WHERE b.SCHD_PROD_DATE = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;

export const QryChckShiftById = `SELECT a.ID_SITELINE, SUBSTRING_INDEX(a.SHIFT,"_",1) SHIFT  FROM item_siteline a WHERE a.ID_SITELINE = :idSiteline`;
