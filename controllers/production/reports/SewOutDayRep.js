import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  getSewOutDayRepSize,
  QrySewDayOutByPo,
  QrySewDaySizeByPO,
  QuerySewOutDayRep,
} from "../../../models/reports/sewDayOutRep.mod.js";

//query get plan vs actual output sew
export const getSewDayRepSchd = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db.query(QuerySewOutDayRep, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: detailSch,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing output dayli",
      data: error,
    });
  }
};

//query get plan vs actual output sew
export const getSewDayRepPO = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db.query(QrySewDayOutByPo, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: detailSch,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing output dayli by po",
      data: error,
    });
  }
};

//query get plan vs actual output sew size
export const getSewDayRepSize = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db.query(getSewOutDayRepSize, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: detailSch,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing output dayli Size",
      data: error,
    });
  }
};
//query get plan vs actual output sew size and PO
export const getSewDayRepSizePo = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db.query(QrySewDaySizeByPO, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: detailSch,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing output dayli Size by po",
      data: error,
    });
  }
};
