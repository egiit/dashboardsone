import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanQuality = db.define(
  "order_scan_log",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    QC_SCANTIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

ScanQuality.removeAttribute("id");

export const QCWorkdoneByDate = `SELECT * FROM ViewWorkdoneQC WHERE ScanDate BETWEEN :startDate AND :endDate`;

export const QcType = db.define(
  "qc_inspection_type",
  {
    QC_TYPE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    QC_TYPE_NAME: { type: DataTypes.STRING, allowNull: false },
    QC_TYPE_ADD_ID: { type: DataTypes.INTEGER },
    QC_TYPE_MOD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export const QcUsers = db.define(
  "qc_inspection_user",
  {
    QC_USER_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    QC_USERNAME: { type: DataTypes.STRING, allowNull: false },
    QC_NAME: { type: DataTypes.STRING },
    QC_TYPE_ID: { type: DataTypes.INTEGER },
    SITE_NAME: { type: DataTypes.STRING },
    ID_SITELINE: { type: DataTypes.STRING },
    QC_USER_PASSWORD: { type: DataTypes.STRING },
    QC_USER_REF_TOKEN: { type: DataTypes.STRING },
    QC_USER_ACTIVE: { type: DataTypes.STRING },
    QC_USER_ADD_ID: { type: DataTypes.INTEGER },
    QC_USER_DEL: { type: DataTypes.INTEGER },
    QC_USER_MOD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export const QueryGetListUserQc = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_TYPE_ID, c.QC_TYPE_NAME, a.ID_SITELINE,  b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.QC_USER_ACTIVE, a.QC_USER_DEL FROM qc_inspection_user a
LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
LEFT JOIN qc_inspection_type c ON c.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1'
`;

export const QueryGetUserQc = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_USER_PASSWORD, a.QC_USER_REF_TOKEN, a.QC_TYPE_ID,
c.QC_TYPE_NAME, a.ID_SITELINE,  b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.QC_USER_ACTIVE, a.QC_USER_DEL 
FROM qc_inspection_user a
LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
LEFT JOIN qc_inspection_type c ON c.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1' AND a.QC_USERNAME = :userNameQc`;

export const QueryGetUserQcReftok = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_USER_PASSWORD, a.QC_USER_REF_TOKEN, a.QC_TYPE_ID,
c.QC_TYPE_NAME, a.ID_SITELINE,  b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.QC_USER_ACTIVE, a.QC_USER_DEL 
FROM qc_inspection_user a
LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
LEFT JOIN qc_inspection_type c ON c.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1' AND a.QC_USER_REF_TOKEN = :reftoken`;

export const QueryGetListPart = `SELECT a.PART_CODE, a.PART_NAME FROM item_part a ORDER BY a.PART_ORDER`;
export const QueryGetListDefect = `SELECT a.DEFECT_SEW_CODE, a.DEFECT_NAME FROM item_defect_internal a WHERE a.DEFECT_SEW_CODE IS NOT NULL`;
