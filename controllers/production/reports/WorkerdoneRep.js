import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { QueryWorkerDone } from "../../../models/reports/workerdone.mod.js";

//query get plan vs actual Manpower
export const getWorkerDoneRep = async (req, res) => {
  try {
    const { scanDate } = req.params;
    const workerdone = await db.query(QueryWorkerDone, {
      replacements: { scanDate },
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
