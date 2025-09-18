import { DataTypes } from "sequelize";
import db from "../../config/database.js";

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
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'createdAt'
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