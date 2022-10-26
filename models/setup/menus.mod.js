import { DataTypes } from "sequelize";
import db from "../../config/database.js";

// import { DataTypes } from 'Sequelize';

const Menus = db.define(
  "xref_menu_web",
  {
    MENU_ID: { type: DataTypes.INTEGER },
    MENU_CONTROL_ID: { type: DataTypes.INTEGER },
    MENU_MODUL: { type: DataTypes.STRING },
    MENU_GROUP: { type: DataTypes.STRING },
    MENU_GROUP_SUB: { type: DataTypes.STRING },
    MENU_SUB: { type: DataTypes.STRING },
    MENU_SUB_KEY: { type: DataTypes.INTEGER },
    MENU_KEY: { type: DataTypes.STRING },
    MENU_FORM: { type: DataTypes.STRING },
    MENU_NAME: { type: DataTypes.STRING },
    MENU_TITLE: { type: DataTypes.STRING },
    MENU_DESC: { type: DataTypes.STRING },
    MENU_PATH: { type: DataTypes.STRING },
    MENU_ICON: { type: DataTypes.STRING },
    MENU_ACT_VIW: { type: DataTypes.INTEGER },
    MENU_ACT_ADD: { type: DataTypes.INTEGER },
    MENU_ACT_MOD: { type: DataTypes.INTEGER },
    MENU_ACT_DEL: { type: DataTypes.INTEGER },
    MENU_ACT_SAV: { type: DataTypes.INTEGER },
    MENU_ACT_REF: { type: DataTypes.INTEGER },
    MENU_ACT_SEL: { type: DataTypes.INTEGER },
    MENU_ACT_USEL: { type: DataTypes.INTEGER },
    MENU_ACT_FND: { type: DataTypes.INTEGER },
    MENU_ACT_PRN: { type: DataTypes.INTEGER },
    MENU_ACT_IMPORT: { type: DataTypes.INTEGER },
    MENU_ACT_EXPORT: { type: DataTypes.INTEGER },
    MENU_ADD_DATE: { type: DataTypes.DATE },
    MENU_ORDER: { type: DataTypes.INTEGER },
  },
  {
    freezeTableName: true,
    // createdAt: "MENU_ACT_ADD",
    // updatedAt: "MENU_ACT_MOD",
    createdAt: false,
    updatedAt: false,
  }
);

export default Menus;

Menus.removeAttribute("id");
