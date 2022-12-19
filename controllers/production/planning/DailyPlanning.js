import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { QueryDailyPlann } from "../../../models/planning/dailyPlan.mod.js";

export const getDailyPlanning = async (req, res) => {
  try {
    const { plannDate } = req.params;

    const dailyPlann = await db.query(QueryDailyPlann, {
      replacements: {
        plannDate: plannDate,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(dailyPlann);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
