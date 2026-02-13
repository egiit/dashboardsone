import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const SiteLine = db.define(
    "item_siteline",
    {
        ID_SITELINE: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
        },
        SITE: { type: DataTypes.STRING, allowNull: true },
        LINE: { type: DataTypes.STRING, allowNull: true },
        SITE_NAME: { type: DataTypes.STRING, allowNull: true },
        LINE_NAME: { type: DataTypes.STRING, allowNull: true },
        SHIFT: { type: DataTypes.STRING },
        DEFAULT_MANPOWER: { type: DataTypes.STRING },
        FOREMAN: { type: DataTypes.STRING },
        START_TIME: { type: DataTypes.TIME },
        END_TIME: { type: DataTypes.TIME },
        CREATE_BY: { type: DataTypes.INTEGER },
        CREATE_DATE: { type: DataTypes.DATE },
        UPDATE_BY: { type: DataTypes.INTEGER },
        UPDATE_DATE: { type: DataTypes.DATE },
    },
    {
        freezeTableName: true,
        createdAt: "CREATE_DATE",
        updatedAt: "UPDATE_DATE",
    }
);
