import { DataTypes } from "sequelize";
import db from "../../config/database.js";


export const Orders = db.define(
  "order_detail", {
    BUYER_CODE: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    ORDER_NO: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    PRODUCT_TYPE: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    BUYER_PO: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    MO_NO: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ORDER_VERSION: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    SHIPMENT_DATE: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ORDER_QTY: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    ORDER_COLOR: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ORDER_SIZE: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    ORDER_STYLE: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    SITE_LINE: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    DATE_CREATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DATE_UPDATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    freezeTableName: true,
    createdAt: "DATE_CREATE",
    updatedAt: "DATE_UPDATE",
  }
);

export const ScanCutting = db.define(
  "order_scan_log", {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    CUTTING_SCANTIME: {
      type: DataTypes.NOW,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

ScanCutting.removeAttribute("id");
