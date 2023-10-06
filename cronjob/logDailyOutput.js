// import moment from "moment";
import db from "../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { LogDailyOutput } from "../models/planning/dailyPlan.mod.js";
import moment from "moment";
import { getForRecapLog } from "../models/reports/logDailyOutput.mod.js";
import {
  logEndlineCheck,
  queryQcLogCheck,
} from "../models/production/quality.mod.js";

export const cronLogDialyOut = async () => {
  try {
    console.log("start loging");
    const curtime = moment();
    const dayName = curtime.format("dddd");
    const currDate = curtime.format("YYYY-MM-DD");
    const times = curtime.format("HH");
    const listHour = ["00", "01"];

    if (dayName !== "Sunday" && !listHour.includes(times)) {
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
            console.log("qty loging");
          }
        });

        const getDataLogQcCheck = await db.query(queryQcLogCheck, {
          //   replacements: {
          //     schDate: date,
          //   },
          type: QueryTypes.SELECT,
        });

        if (getDataLogQcCheck.length > 0) {
          console.log("Start qc log");

          await logEndlineCheck
            .destroy({
              where: {
                SCHD_PROD_DATE: currDate,
              },
            })
            .then((res) => {
              logEndlineCheck.bulkCreate(getDataLogQcCheck);
              console.log("success qc log");
            });
        }
      }
    }
    console.log("End loging");
  } catch (error) {
    console.log(error);
  }
};
