import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { QueryWipMonitor } from "../../../models/reports/sewWipMonitor.mod.js";

//query get plan vs actual output sew
export const getMasterWipMonitor = async (req, res) => {
  try {
    const { sitename, startDate, endDate } = req.params;
    const detailSch = await db.query(QueryWipMonitor, {
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
