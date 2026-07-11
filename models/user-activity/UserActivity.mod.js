import db, {dbLog} from "../../config/database.js";
import {DataTypes} from "sequelize";

export const UserConnectionHistory = await dbLog.define("user_connection_history", {
    ID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    USER_ID: {
        type: DataTypes.INTEGER,
    },
    APP_TYPE: {
        type: DataTypes.STRING(255)
    },
    SOCKET_KEY: {
        type: DataTypes.TEXT
    },
    ACTION_TYPE: {
        type: DataTypes.ENUM('CONNECTED', 'DISCONNECT')
    },
    CREATED_AT: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "user_connection_history",
    freezeTableName: true,
    timestamps: false,
})

export const UserHistoryRoute = await dbLog.define("user_history_route", {
    ID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    USER_ID: {
        type: DataTypes.INTEGER,
    },
    NAME: {
        type: DataTypes.STRING(255),
    },
    PATH_URL: {
        type: DataTypes.TEXT,
    },
    CREATED_AT: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "user_history_route",
    freezeTableName: true,
    timestamps: false,
})