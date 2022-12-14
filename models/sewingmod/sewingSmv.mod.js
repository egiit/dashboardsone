import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const SewingSmvHeader = db.define(
  "item_smv_header",
  {
    ORDER_NO: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    ORDER_REF_PO_NO: { type: DataTypes.STRING },
    PRODUCT_ID: { type: DataTypes.STRING },
    PLAN_SEW_SMV: { type: DataTypes.DOUBLE },
    ACTUAL_SEW_SMV: { type: DataTypes.DOUBLE },
    SMV_CONF_STATUS: { type: DataTypes.STRING },
    SMV_CONF_DATE: { type: DataTypes.DATE },
    SMV_CONF_ID_FX: { type: DataTypes.STRING },
    SMV_UPDATE_STATUS: { type: DataTypes.STRING },
    SMV_UPDATE_DATE: { type: DataTypes.DATE },
    SMV_UPDATE_ID_FX: { type: DataTypes.STRING },
    SMV_ADD_ID: { type: DataTypes.BIGINT },
    SMV_ADD_DATE: { type: DataTypes.DATE },
    SMV_MOD_ID: { type: DataTypes.BIGINT },
    SMV_MOD_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "SMV_ADD_DATE",
    updatedAt: "SMV_MOD_DATE",
  }
);

export const QuerySmvHeader = `SELECT b.MANUFACTURING_COMPANY, b.CUSTOMER_NAME, b.CUSTOMER_DIVISION, b.CUSTOMER_SEASON, a.ORDER_NO, b.ORDER_TYPE_CODE, a.ORDER_REF_PO_NO,
b.PRODUCT_ID, b.ORDER_STYLE_DESCRIPTION, b.PRODUCT_ITEM_ID, b.PRODUCT_CATEGORY, b.PRODUCT_ITEM_DESCRIPTION, a.PLAN_SEW_SMV, a.ACTUAL_SEW_SMV,
a.SMV_CONF_STATUS, a.SMV_CONF_DATE, a.SMV_CONF_ID_FX, a.SMV_UPDATE_STATUS, a.SMV_UPDATE_DATE, a.SMV_UPDATE_ID_FX
FROM item_smv_header a 
LEFT JOIN viewblk b ON a.ORDER_NO = b.ORDER_NO`;
