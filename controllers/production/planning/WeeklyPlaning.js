import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QueryCapacity,
  QueryGetDayliSch,
  QueryGetHeadWeekSch,
} from "../../../models/planning/weekLyPlan.mod.js";
import moment from "moment";

export const getCapacity = async (req, res) => {
  try {
    const { startMonth, endMonth, startDate, endDate } = req.params;
    // console.log(moment(startMonth));
    // if (moment(startMonth) > moment(endMonth))
    //   return res.status(404).json({
    //     message: "Please Set Start Month Less Than End Month",
    //   });

    if (startMonth && endMonth) {
      const capacity = await db.query(QueryCapacity, {
        replacements: {
          startMonth: startMonth,
          endMonth: endMonth,
          startDate: startDate,
          endDate: endDate,
        },
        type: QueryTypes.SELECT,
      });

      return res.json(capacity);
    }
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getHeaderWeekSch = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const weekSchHead = await db.query(QueryGetHeadWeekSch, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(weekSchHead);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//get daily or detail schedule/planing
export const getDayliSch = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const detailSch = await db.query(QueryGetDayliSch, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(detailSch);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
