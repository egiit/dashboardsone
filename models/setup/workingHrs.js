import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const WorkingHours = db.define(
  "item_working_hours",
  {
    WH_ID: { type: DataTypes.INTEGER, primaryKey: true },
    WH_DAYNAME: { type: DataTypes.STRING },
    WH_VALUE: { type: DataTypes.INTEGER },
    WH_ADD_ID: { type: DataTypes.BIGINT },
    WH_MOD_ID: { type: DataTypes.BIGINT },
    WH_ADD_DATE: { type: DataTypes.DATE },
    WH_MOD_DATE: { type: DataTypes.DATE },
  },
  { freezeTableName: true, createdAt: "WH_ADD_DATE", updatedAt: "WH_MOD_DATE" }
);
