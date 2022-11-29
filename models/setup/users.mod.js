import { DataTypes } from "sequelize";
import db from "../../config/database.js";

// import { DataTypes } from 'Sequelize';

const Users = db.define(
  "xref_user_web",
  {
    USER_ID: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    USER_INISIAL: { type: DataTypes.STRING(30), allowNull: false },
    USER_NAME: { type: DataTypes.STRING(30), unique: true, allowNull: false },
    USER_PASS: { type: DataTypes.STRING },
    USER_REF_TOKEN: { type: DataTypes.TEXT },
    USER_TEL: { type: DataTypes.STRING(50) },
    USER_EMAIL: { type: DataTypes.STRING(100), unique: true },
    USER_DEP: { type: DataTypes.BIGINT },
    USER_JAB: { type: DataTypes.BIGINT },
    USER_DESC: { type: DataTypes.STRING },
    USER_LEVEL: { type: DataTypes.TEXT },
    USER_PASS_WEB: { type: DataTypes.STRING },
    USER_UNIT: { type: DataTypes.STRING(20) },
    USER_PATH: { type: DataTypes.STRING },
    USER_ACCES: { type: DataTypes.STRING(20) },
    USER_FLAG: { type: DataTypes.STRING(20) },
    USER_AKTIF_STATUS: { type: DataTypes.INTEGER },
    USER_DELETE_STATUS: { type: DataTypes.INTEGER },
    USER_DARK_MODE: { type: DataTypes.STRING },
    USER_ADD_DATE: { type: DataTypes.DATE },
    USER_MOD_DATE: { type: DataTypes.DATE },
    USER_ADD_ID: { type: DataTypes.BIGINT },
    USER_MOD_ID: { type: DataTypes.BIGINT },
  },
  {
    freezeTableName: true,
    createdAt: "USER_ADD_DATE",
    updatedAt: "USER_MOD_DATE",
  }
);

export default Users;
