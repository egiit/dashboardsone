// import moment from "moment";
import db from "../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { LogDailyOutput } from "../models/planning/dailyPlan.mod.js";
import moment from "moment";
import { getForRecapLog } from "../models/reports/logDailyOutput.mod.js";

export const cronLogDialyOut = async () => {
  try {
    const curtime = moment();
    const dayName = curtime.format("dddd");
    const currDate = curtime.format("YYYY-MM-DD");

    if (dayName !== "Sunday") {
      const getDataLog = await db.query(getForRecapLog, {
        //   replacements: {
        //     schDate: date,
        //   },
        type: QueryTypes.SELECT,
      });

      //   console.log(getDataLog.length);
      if (getDataLog.length > 1) {
        await LogDailyOutput.destroy({
          where: {
            SCHD_PROD_DATE: currDate,
          },
        }).then((res) => {
          //   console.log(res);
          if (res) {
            LogDailyOutput.bulkCreate(getDataLog);
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
