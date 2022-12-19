import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { QueryDailyPlann } from "../../../models/planning/dailyPlan.mod.js";

export const getDailyPlanning = async (req, res) => {
  try {
    const { plannDate, sitename } = req.params;

    const pland = await db.query(QueryDailyPlann, {
      replacements: {
        plannDate: plannDate,
        sitename: sitename,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(pland);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
