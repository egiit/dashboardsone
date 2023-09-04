// import db2 from "../../../config/database.js";
import { db2 } from "../../../config/database.js";

import { QueryTypes, Op } from "sequelize";
import {
  QryMesHederRepList,
  QueryDetailEndCheck,
  QueryDtlDayDef,
  QueryDtlDayDefSum,
  QueryDtlEndChckTblet,
  QueryGetDescMes,
  QueryMeasSpecRep,
  QueryMesValueRep,
  QuerySumPartDefCodChk,
  QuerySumPartDefCodeCheck,
  QurTablPlanQcEndRep,
} from "../../../models/production/qcEndRep.mod.js";

//get list plan size for main table
export const getPlanningEendReport = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db2.query(QurTablPlanQcEndRep, {
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
      message: "error processing get data planning endline",
      data: error,
    });
  }
};

//get list qc endline check per hour
export const getQcEndCheckPerHour = async (req, res) => {
  try {
    const { schDate, idSiteLine, schdId } = req.params;
    const checkPerHour = await db2.query(QueryDetailEndCheck, {
      replacements: {
        schDate: schDate,
        idSiteLine: idSiteLine,
        schdId: schdId,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: checkPerHour,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data check perhour",
      data: error,
    });
  }
};

//get list qc endline check per hour
export const getQcEndSumPartDefCode = async (req, res) => {
  try {
    const { schDate, idSiteLine, schdId } = req.params;
    const checkPerHour = await db2.query(QuerySumPartDefCodeCheck, {
      replacements: {
        schDate: schDate,
        idSiteLine: idSiteLine,
        schdId: schdId,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: checkPerHour,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data check perhour",
      data: error,
    });
  }
};

//get list qc endline check per hour
export const getQcEndChckTablet = async (req, res) => {
  try {
    const { schDate, idSiteLine } = req.params;
    const checkPerHour = await db2.query(QueryDtlEndChckTblet, {
      replacements: {
        schDate: schDate,
        idSiteLine: idSiteLine,
        //   schdId: schdId,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: checkPerHour,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data check perhour",
      data: error,
    });
  }
};

//get list qc endline check per hour tablet
export const getQcEndDefReprTblt = async (req, res) => {
  try {
    const { schDate, idSiteLine } = req.params;
    const checkPerHour = await db2.query(QuerySumPartDefCodChk, {
      replacements: {
        schDate: schDate,
        idSiteLine: idSiteLine,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: checkPerHour,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data check perhour",
      data: error,
    });
  }
};

//get list detail defect
export const getDailyDefDetail = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db2.query(QueryDtlDayDef, {
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
      message: "error processing get deteail defect",
      data: error,
    });
  }
};

//get list detail defect Sumary
export const getDailyDefDetailSum = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db2.query(QueryDtlDayDefSum, {
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
      message: "error processing get deteail defect",
      data: error,
    });
  }
};

//get bulk report measurement
export const getMeasurementRep = async (req, res) => {
  try {
    const { schDate, sitename, linename, orderNo } = req.params;

    const desc = await db2.query(QueryGetDescMes, {
      replacements: { orderNo },
      type: QueryTypes.SELECT,
    });
    //spec by size
    const specList = await db2.query(QueryMeasSpecRep, {
      replacements: { orderNo, schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });
    //detail value
    const values = await db2.query(QueryMesValueRep, {
      replacements: { orderNo, schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });
    //detail value
    const headers = await db2.query(QryMesHederRepList, {
      replacements: { orderNo, schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: { desc, specList, values, headers },
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get deteail defect",
      data: error,
    });
  }
};
