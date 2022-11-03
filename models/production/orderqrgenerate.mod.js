import { DataTypes } from "sequelize";
import db from "../../config/database.js";


export const GenerateQR = db.define(
    "order_qr_generate", {
        BARCODE_SERIAL: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        BUNDLE_SEQUENCE: {
            type: DataTypes.INTEGER(100),
            allowNull: false,
        },
        CREATE_TIME: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        CREATE_BY: {
            type: DataTypes.INTEGER(20),
            allowNull: true,
        },
        UPDATE_TIME: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        UPDATE_BY: {
            type: DataTypes.INTEGER(20),
            allowNull: true,
        },

    }, {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false
    }
);

GenerateQR.removeAttribute("id");

export default GenerateQR;