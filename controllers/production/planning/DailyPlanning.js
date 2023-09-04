import { db2 } from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  LogDailyOutput,
  QryDailyResultForSyncLog,
  QueryDailyPlann,
  QueryDailySchSewIn,
  QueryQcEndlineDaily,
  SmvDailyPlan,
} from "../../../models/planning/dailyPlan.mod.js";
import {
  ManpowewrDailyDetail,
  WorkingHoursDetail,
} from "../../../models/production/sewing.mod.js";
import { QueryEffCurDate } from "../../../models/reports/sewDayliEffRep.mod.js";

export const getDailyPlanning = async (req, res) => {
  try {
    const { plannDate, sitename, shift } = req.params;

    const pland = await db2.query(QueryEffCurDate, {
      // const pland = await db2.query(QueryDailyPlann, {
      replacements: {
        schDate: plannDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(pland);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const syncLogDailyOutput = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;

    const planWithOutput = await db2.query(QryDailyResultForSyncLog, {
      // const pland = await db2.query(QueryDailyPlann, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    if (planWithOutput.length === 0)
      return res.json({ status: false, message: "No Data Plan And Output" });

    const findLog = await LogDailyOutput.findAll({
      where: {
        SCHD_PROD_DATE: schDate,
        SITE_NAME: sitename,
        SHIFT: shift,
      },
    });

    if (findLog.length > 0) {
      await LogDailyOutput.destroy({
        where: {
          SCHD_PROD_DATE: schDate,
          SITE_NAME: sitename,
          SHIFT: shift,
        },
      });
    }

    await LogDailyOutput.bulkCreate(planWithOutput)
      .then(() => {
        return res.status(200).json({
          success: true,
          message: "Recap Successfull",
        });
      })
      .catch((err) => {
        res.status(404).json({
          message: "error processing request",
          data: err,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getDailySchSewIn = async (req, res) => {
  try {
    const { plannDate, sitename } = req.params;
    const pland = await db2.query(QueryDailySchSewIn, {
      replacements: {
        plannDate: plannDate,
        sitename: sitename,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(pland);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//schedule untuk tablet qc Endline
export const getDailyPlanningQCend = async (req, res) => {
  try {
    const { plannDate, sitename, linename, idstieline, shift } = req.params;

    const pland = await db2.query(QueryQcEndlineDaily, {
      replacements: {
        plannDate: plannDate,
        sitename: sitename,
        linename: linename,
        idstieline: idstieline,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(pland);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

// Update daily SMV
export const postSmvPlan = async (req, res) => {
  try {
    let data = req.body;
    const findSmv = await SmvDailyPlan.findOne({
      where: {
        SCHD_ID: data.SCHD_ID,
        SHIFT: data.SHIFT,
      },
    });
    if (findSmv) {
      delete data.CREATE_BY;
      delete data.CREATE_DATE;
      await SmvDailyPlan.update(data, {
        where: {
          SCHD_ID: data.SCHD_ID,
          SHIFT: data.SHIFT,
        },
      });
      return res.status(200).json({ message: "Success Set Smv" });
    } else {
      delete data.UPDATE_BY;
      delete data.UPDATE_DATE;
      const newWh = await SmvDailyPlan.create(data);
      return res.status(200).json({ message: "Success Set SMV", data: newWh });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//clear manpower and working hour by array from select checkbo
export const clearMpAndWh = async (req, res) => {
  try {
    const listSchdule = req.body;

    if (listSchdule.length === 0)
      return res.status(404).json({
        message: "No Data List Schedule",
      });

    let exeClear = async () => {
      for (const [i, schd] of listSchdule.entries()) {
        // before clear find first mp
        const findMpDetail = await ManpowewrDailyDetail.findOne({
          where: {
            SCHD_ID: schd.SCHD_ID,
            SHIFT: schd.SHIFT,
          },
        });

        //if find clear mp ot and mp extra ot
        if (findMpDetail) {
          const dataUpdt = { PLAN_MP_OT: null, PLAN_MP_X_OT: null };
          await ManpowewrDailyDetail.update(dataUpdt, {
            where: {
              ID_MPD: findMpDetail.ID_MPD,
              SCHD_ID: schd.SCHD_ID,
              SHIFT: schd.SHIFT,
            },
          });
        }

        //for clear working hour detail
        const findWh = await WorkingHoursDetail.findOne({
          where: {
            SCHD_ID: schd.SCHD_ID,
            SHIFT: schd.SHIFT,
          },
        });

        const dataUpdtWh = {
          PLAN_WH: 0,
          PLAN_WH_OT: null,
          PLAN_WH_X_OT: null,
        };
        if (findWh) {
          await WorkingHoursDetail.update(dataUpdtWh, {
            where: {
              ID_WHD: findWh.ID_WHD,
              SCHD_ID: schd.SCHD_ID,
              SHIFT: schd.SHIFT,
            },
          });
        } else {
          await WorkingHoursDetail.create({ ...schd, dataUpdtWh });
        }

        if (i + 1 === listSchdule.length) {
          return res.status(200).json({ message: "Success Clear" });
        }
      }
    };

    exeClear();
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
