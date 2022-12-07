import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const QueryCapacity = `SELECT a.PRODUCTION_MONTH, a.MANUFACTURING_SITE, a.CUSTOMER_NAME,a.CUSTOMER_DIVISION, a.CUSTOMER_PROGRAM,
a.CUSTOMER_SEASON, a.ORDER_NO, a.ORDER_REFERENCE_PO_NO, a.PRODUCT_ITEM_CODE, a.PRODUCT_ITEM_DESCRIPTION, a.ORDER_STYLE_DESCRIPTION,
a.ITEM_COLOR_CODE, a.ITEM_COLOR_NAME, a.MO_NO, a.TARGET_PCD, a.PLAN_EXFACTORY_DATE, a.FINAL_DELIVERY_DATE,
a.NEW_TARGET_PCD, a.NEW_PLAN_EXFACTORY_DATE,  a.NEW_FINAL_DELIVERY_DATE, 
a.MO_QTY, a.ORDER_QTY, n.SCH_QTY, (a.ORDER_QTY-n.SCH_QTY) VAR_QTY, a.ID_CAPACITY, a.PROD_MONTH
FROM ViewCapacity a 
LEFT JOIN (
	SELECT a.SCH_CAPACITY_ID, SUM(a.SCH_QTY) SCH_QTY
	FROM weekly_prod_schedule a  
	WHERE a.SCH_PROD_MONTH BETWEEN  :startMonth AND :endMonth
	GROUP BY a.SCH_CAPACITY_ID
	) n ON a.ID_CAPACITY = n.SCH_CAPACITY_ID
WHERE a.PROD_MONTH BETWEEN :startMonth AND :endMonth
ORDER BY a.PROD_MONTH, a.MANUFACTURING_SITE, a.CUSTOMER_NAME, a.CUSTOMER_DIVISION, a.ORDER_REFERENCE_PO_NO, a.PRODUCT_ITEM_CODE, a.PLAN_EXFACTORY_DATE`;

export const QueryGetHeadWeekSch = `SELECT a.SCH_ID, b.PROD_MONTH, CASE WHEN ISNULL(a.SCH_START_PROD) THEN b.PRODUCTION_MONTH ELSE DATE_FORMAT(a.SCH_START_PROD,'%M/%Y') END ACTUAL_MONTH,
b.PRODUCTION_MONTH, b.MANUFACTURING_SITE,  a.SCH_SITE, a.SCH_ID_SITELINE, c.LINE_NAME, b.CUSTOMER_NAME, a.SCH_CAPACITY_ID,
a.SCH_QTY, b.MO_QTY, b.ORDER_REFERENCE_PO_NO, b.PRODUCT_ITEM_CODE, b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, b.ITEM_COLOR_NAME, b.TARGET_PCD, b.PLAN_EXFACTORY_DATE,
b.FINAL_DELIVERY_DATE, a.SCH_START_PROD, a.SCH_FINISH_PROD, a.SCH_ORDER,
b.NEW_TARGET_PCD, b.NEW_PLAN_EXFACTORY_DATE,  b.NEW_FINAL_DELIVERY_DATE
FROM weekly_prod_schedule a  
LEFT JOIN ViewCapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
WHERE  a.SCH_START_PROD BETWEEN :startDate AND :endDate
OR a.SCH_FINISH_PROD BETWEEN :startDate AND :endDate  OR IFNULL(a.SCH_START_PROD ,'') =  '';;`;

export const QueryGetHeadWeekSchOne = `SELECT a.SCH_ID, b.PROD_MONTH,  b.PRODUCTION_MONTH, b.MANUFACTURING_SITE,  a.SCH_SITE, a.SCH_ID_SITELINE, c.LINE_NAME, b.CUSTOMER_NAME, a.SCH_CAPACITY_ID,
a.SCH_QTY, b.MO_QTY, b.ORDER_REFERENCE_PO_NO, b.PRODUCT_ITEM_CODE, b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, b.ITEM_COLOR_NAME, b.TARGET_PCD, b.PLAN_EXFACTORY_DATE,
b.FINAL_DELIVERY_DATE, a.SCH_START_PROD, a.SCH_FINISH_PROD, a.SCH_ORDER,
b.NEW_TARGET_PCD, b.NEW_PLAN_EXFACTORY_DATE,  b.NEW_FINAL_DELIVERY_DATE
FROM weekly_prod_schedule a  
LEFT JOIN ViewCapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
WHERE a.SCH_ID = :schId`;

export const QueryGetDayliSch = `SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_MONTH, a.SCHD_PROD_DATE, a.SCHD_SITE, a.SCHD_ID_SITELINE,
a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, b.SCH_QTY SCHD_HEADER_QTY,  a.SCHD_HEAD_BALANCE, a.SCHD_QTY
FROM weekly_prod_sch_detail a 
LEFT JOIN weekly_prod_schedule b ON a.SCH_ID = b.SCH_ID
WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate AND a.SCH_ID LIKE :schId
ORDER BY a.SCHD_DAYS_NUMBER`;

export const QueryGetOneDayliSch = `SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_MONTH, a.SCHD_PROD_DATE, a.SCHD_SITE, a.SCHD_ID_SITELINE,
a.SCHD_CAPACITY_ID, a.SCHD_DAYS_NUMBER, b.SCH_QTY SCHD_HEADER_QTY,  a.SCHD_HEAD_BALANCE, a.SCHD_QTY
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
