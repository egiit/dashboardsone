import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanSewing = db.define(
  "order_scan_log",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    SEWING_SCANTIME: {
      type: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

ScanSewing.removeAttribute("id");

export const SewingListSite = `SELECT DISTINCT a.SITE, a.SITE_NAME FROM item_siteline a`;
export const SewingListLine = `SELECT a.ID_SITELINE, a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME, a.SHIFT, a.DEFAULT_MANPOWER, a.FOREMAN, a.START_TIME, a.END_TIME FROM  item_siteline a`;
export const SewingListLineByGroup = `SELECT DISTINCT a.ID_SITELINE, a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME, a.SHIFT, a.DEFAULT_MANPOWER,
a.FOREMAN, a.START_TIME, a.END_TIME 
FROM  item_siteline a
GROUP BY a.SITE, a.SITE_NAME, a.LINE_NAME`;

export const SewingWorkdoneByDate = `SELECT * FROM ViewWorkdoneSewing WHERE ScanDate BETWEEN :startDate AND :endDate`;

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

export const GetMpPlanVsActual = `SELECT b.ID_MPD, b.MP_DATE, a.ID_SITELINE, a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME, a.SHIFT, a.DEFAULT_MANPOWER, b.PLAN_WH, b.PLAN_MP, ROUND(b.PLAN_MP*0.0909) PLAN_AB, 
b.ACT_WH,b.ACT_MP, ((b.PLAN_MP - b.ACT_MP)/b.PLAN_MP)*100 ACTUAL_AB,  b.OT_WH, b.OT_MP
FROM  item_siteline a
LEFT JOIN manpower_detail b ON a.ID_SITELINE = b.ID_SITELINE AND b.MP_DATE = :date
WHERE a.SITE = :site AND a.SHIFT = :shift`;

export const ManPoerDetail = db.define(
  "manpower_detail",
  {
    ID_MPD: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    MP_DATE: { type: DataTypes.DATE },
    ID_SITELINE: { type: DataTypes.STRING },
    PLAN_WH: { type: DataTypes.INTEGER },
    PLAN_MP: { type: DataTypes.INTEGER },
    ACT_WH: { type: DataTypes.INTEGER },
    ACT_MP: { type: DataTypes.INTEGER },
    OT_WH: { type: DataTypes.INTEGER },
    OT_MP: { type: DataTypes.INTEGER },
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

export const WorkingHoursDetail = db.define(
  "workinghour_detail",
  {
    ID_WHD: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    SCHD_ID: { type: DataTypes.BIGINT },
    LINE_NAME: { type: DataTypes.STRING },
    SHIFT: { type: DataTypes.STRING },
    PLAN_WH: { type: DataTypes.INTEGER },
    ACT_WH: { type: DataTypes.INTEGER },
    PLAN_WH_OT: { type: DataTypes.INTEGER },
    ACT_WH_OT: { type: DataTypes.INTEGER },
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

export const ManpowewrDailyDetail = db.define(
  "mp_daily_detail",
  {
    ID_MPD: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    SCHD_ID: { type: DataTypes.BIGINT },
    SHIFT: { type: DataTypes.STRING },
    LINE_NAME: { type: DataTypes.STRING },
    PLAN_MP: { type: DataTypes.INTEGER },
    ACT_MP: { type: DataTypes.INTEGER },
    PLAN_MP_OT: { type: DataTypes.INTEGER },
    ACT_MP_OT: { type: DataTypes.INTEGER },
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

export const RemarkDailyDetail = db.define(
  "remark_detail",
  {
    ID_REMARK: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    SCHD_ID: { type: DataTypes.BIGINT },
    SHIFT: { type: DataTypes.STRING },
    LINE_NAME: { type: DataTypes.STRING },
    PLAN_REMARK: { type: DataTypes.STRING },
    ACT_REMARK: { type: DataTypes.STRING },
    ACT_OT_REMARK: { type: DataTypes.STRING },
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
