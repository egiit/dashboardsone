import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const QueryBlkForMeasur = `SELECT a.PROD_MONTH, a.CUSTOMER_NAME, a.ORDER_NO, a.PRODUCT_ID, 
a.PRODUCT_ITEM_ID, a.ORDER_REFERENCE_PO_NO,
a.PRODUCT_CATEGORY, a.PRODUCT_ITEM_CODE, a.PRODUCT_ITEM_DESCRIPTION, a.ORDER_STYLE_DESCRIPTION 
FROM viewblk a WHERE a.PROD_MONTH BETWEEN :startMonth AND :endMonth 
ORDER BY a.PROD_MONTH, a.CUSTOMER_NAME`;

export const QueryListBuyer = `SELECT a.ID id, a.CUSTOMER_NAME name FROM view_list_buyer a`;
export const QueryLsitStyle = `SELECT a.PRODUCT_ITEM_ID id, 
CONCAT(a.PRODUCT_ITEM_CODE,'/',a.PRODUCT_ITEM_DESCRIPTION) name, a.PRODUCT_ITEM_CODE,  a.CUSTOMER_NAME, a.ID_BUYER
FROM view_list_style a -- WHERE a.ID_BUYER = :idBuyer`;

export const MeasurementChart = db.define(
  "measurement_chart",
  {
    MES_BUYER: {
      type: DataTypes.STRING,
    },
    MES_CHART_NO: { type: DataTypes.STRING, primaryKey: true },
    MES_STYLE: { type: DataTypes.STRING },
    MES_DESC: { type: DataTypes.STRING },
    MES_SIZES: { type: DataTypes.STRING },
    MES_UOM: { type: DataTypes.STRING },
    MES_ADD_ID: { type: DataTypes.BIGINT },
    MES_UPDATE_ID: { type: DataTypes.BIGINT },
    MES_ADD_DATE: { type: DataTypes.DATE },
    MES_UPDATE_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "MES_ADD_DATE",
    updatedAt: "MES_UPDATE_DATE",
  }
);

export const MeasChartDetail = db.define(
  "measurement_chart_detail",
  {
    MES_CHART_NO: { type: DataTypes.STRING },
    POM_ID: { type: DataTypes.STRING },
    SIZE_CODE: { type: DataTypes.STRING },
    SPEC: { type: DataTypes.STRING },
    ADD_ID: { type: DataTypes.BIGINT },
    MOD_ID: { type: DataTypes.BIGINT },
    ADD_TIME: { type: DataTypes.DATE },
    MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: "MOD_TIME",
  }
);
MeasChartDetail.removeAttribute("id");

export const MeasPOM = db.define(
  "measurement_pom",
  {
    MES_CHART_NO: { type: DataTypes.STRING },
    POM_ID: { type: DataTypes.STRING },
    POM_DESC: { type: DataTypes.STRING },
    POM_PLUS: { type: DataTypes.STRING },
    POM_MIN: { type: DataTypes.STRING },
    POM_ORDER: { type: DataTypes.INTEGER },
    POM_ADD_ID: { type: DataTypes.BIGINT },
    POM_MOD_ID: { type: DataTypes.BIGINT },
    POM_ADD_TIME: { type: DataTypes.DATE },
    POM_MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "POM_ADD_TIME",
    updatedAt: "POM_MOD_TIME",
  }
);

MeasPOM.removeAttribute("id");

export const QueryGetPOM = `SELECT  a.POM_ORDER 'INDEX', a.POM_ID 'CODE', a.POM_DESC POM, a.POM_MIN 'TOL -', a.POM_PLUS 'TOL +'
FROM measurement_pom a WHERE a.MES_CHART_NO = :chartNo`;

export const QueryGetDtilChart = `SELECT a.MES_CHART_NO, a.POM_ID, a.SIZE_CODE, a.SPEC FROM measurement_chart_detail a WHERE a.MES_CHART_NO = :chartNo`;
export const QueryGetMesSizelist = `SELECT DISTINCT a.SIZE_CODE FROM measurement_chart_detail a WHERE a.MES_CHART_NO = :chartNo`;

export const QryMesCheckInput = `SELECT * FROM measurement_qc_output a WHERE a.MES_CHART_NO = :chartNo AND a.SIZE_CODE = :sizeCode`;
export const QryMesCheckInputPom = `SELECT * FROM measurement_qc_output a WHERE a.MES_CHART_NO = :chartNo AND a.POM_ID = :pomId`;
export const QrcChckMeasChartOut = `SELECT * FROM measurement_qc_output a WHERE a.MES_CHART_NO = :chartNo`;

export const QryGetMesByOrder = `SELECT a.MES_CHART_NO, a.ORDER_NO, b.MES_BUYER, b.MES_STYLE, b.MES_DESC, b.MES_SIZES, b.MES_UOM, b.MES_ADD_DATE, b.MES_UPDATE_DATE
FROM  measurement_and_order a 
LEFT JOIN measurement_chart b ON b.MES_CHART_NO = a.MES_CHART_NO
WHERE  a.ORDER_NO = :orderNo`;
