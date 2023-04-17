import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QryBundleTrack,
  QueryWorkerDone,
} from "../../../models/reports/workerdone.mod.js";

//workerdon controler
export const getWorkerDoneRep = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const workerdone = await db.query(QueryWorkerDone, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(workerdone);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//query get blk tracking
export const getBlkTrace = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const bundleTrace = await db.query(QryBundleTrack, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(bundleTrace);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
