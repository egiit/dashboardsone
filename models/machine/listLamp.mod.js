import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import {SiteLine} from "./siteLine.mod.js";

export const ListLampModel = db.define(
    "list_lamp",
    {
        MAC: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
        },
        IP_ADDRESS: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ID_SITELINE: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        IS_WORK: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'createdAt'
        },
        DATE_TROUBLE: {
            type: DataTypes.DATE,
            allowNull: true
        },
        COUNT_TROUBLE: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updatedAt'
        }
    },
    {
        tableName: 'list_lamp',
        timestamps: true,
        underscored: false
    }
);

ListLampModel.belongsTo(SiteLine, {
    foreignKey: "ID_SITELINE",
    as: "SITELINE",
})