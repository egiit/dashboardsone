import { DataTypes } from "sequelize";
import db from "../../config/database.js";

// import { DataTypes } from 'Sequelize';

const Dept = db.define(
  "xref_dept",
  {
    DEP_ID: { type: DataTypes.INTEGER, primaryKey: true },
    DEP_NAME: { type: DataTypes.STRING, allowNull: false },
    DEP_ADD_ID: { type: DataTypes.INTEGER },
    DEP_MOD_ID: { type: DataTypes.INTEGER },
  },
  { freezeTableName: true }
);

export default Dept;
