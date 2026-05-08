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


export const ListLampEspModel = db.define("list_lamp_esp", {
    ID_SITELINE: {
        type: DataTypes.STRING(100), allowNull: true, primaryKey: true
    },
    MAC_ADDRESS: {
        type: DataTypes.STRING(100), allowNull: false,
    },
    IP_ADDRESS: {
        type: DataTypes.STRING(100), allowNull: true
    },
    HW_NO: {
        type: DataTypes.STRING(100), allowNull: true
    },
    IS_ACTIVE: {
        type: DataTypes.INTEGER, defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE, allowNull: true,
    },
    updatedAt: {
        type: DataTypes.DATE, allowNull: true,
    },
}, {
    freezeTableName: true, timestamps: true, // Sequelize otomatis handle createdAt & updatedAt
});


ListLampEspModel.belongsTo(SiteLine, {
    foreignKey: "ID_SITELINE",
    as: "SITELINE",
})

ListLampModel.belongsTo(SiteLine, {
    foreignKey: "ID_SITELINE",
    as: "SITELINE",
})