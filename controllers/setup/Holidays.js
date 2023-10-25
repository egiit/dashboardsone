import db from "../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QueryGetHoliday,
  QueryGetHolidayByDate,
} from "../../models/setup/holidays.mod.js";

export const getHolidaysByYear = async (req, res) => {
  try {
    const { startYear, endYear } = req.params;
    const holidays = await db.query(QueryGetHoliday, {
      replacements: {
        startYear: startYear,
        endYear: endYear,
      },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(holidays);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Action Problem With Get Holidays Data", data: err });
  }
};

export const getArrHolidayByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const holidays = await db.query(QueryGetHolidayByDate, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(holidays);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Action Problem With Get Holidays Data", data: err });
  }
};
