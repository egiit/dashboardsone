import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QueryQrTrackByWipMonitor,
  QueryWipMonitor,
  QueryWipMonitorSize,
} from "../../../models/reports/sewWipMonitor.mod.js";

//query get plan vs actual output sew
export const getMasterWipMonitor = async (req, res) => {
  try {
    const { sitename, startDate, endDate } = req.params;
    const header = await db.query(QueryWipMonitor, {
      replacements: {
        sitename: sitename,
        startDate: startDate,
        endDate: endDate,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      dataSch: header,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing wip monitoring",
      data: error,
    });
  }
};

//query get plan vs actual output sew
export const getMasterWipMonSize = async (req, res) => {
  try {
    const { sitename, startDate, endDate } = req.params;
    const detailSch = await db.query(QueryWipMonitorSize, {
      replacements: {
        sitename: sitename,
        startDate: startDate,
        endDate: endDate,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      dataBySize: detailSch,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing wip monitoring",
      data: error,
    });
  }
};

//query get tracking by wip monitoring
export const trackingByWipMontioring = async (req, res) => {
  try {
    const { schId, orderSize } = req.params;
    const listTrack = await db.query(QueryQrTrackByWipMonitor, {
      replacements: {
        schId: schId,
        orderSize: orderSize,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      data: listTrack,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data storage tracking",
      data: error,
    });
  }
};
