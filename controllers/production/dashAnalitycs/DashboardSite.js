import moment from "moment";
import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QueryDefRateSite,
  QuerySiteDashNow,
  QuerySiteDashPast,
} from "../../../models/dashAnalitycs/mainDashSew.js";

export const getDataDashSite = async (req, res) => {
  try {
    const { schDate, sitename } = req.params;

    const findListShift = await db.query(
      `
    SELECT DISTINCT a.SHIFT FROM item_siteline a WHERE a.SITE_NAME = :sitename GROUP BY a.SITE_NAME, a.SHIFT
    `,
      {
        // const pland = await db.query(QueryDailyPlann, {
        replacements: {
          sitename: sitename,
        },
        type: QueryTypes.SELECT,
      }
    );

    const today = moment().format("YYYY-MM-DD");

    if (today === schDate) {
      if (findListShift.length > 0) {
        let dataSiteDash = [];

        for (const [i, shift] of findListShift.entries()) {
          const dashSiteData = await db.query(QuerySiteDashNow, {
            // const pland = await db.query(QueryDailyPlann, {
            replacements: {
              schDate: schDate,
              sitename: sitename,
              shift: shift.SHIFT,
            },
            type: QueryTypes.SELECT,
          });
          dataSiteDash.push(...dashSiteData);

          if (i + 1 === findListShift.length) {
            return res.status(200).json({
              success: true,
              data: dataSiteDash,
            });
          }
        }
      } else {
        return res.status(200).json({
          success: false,
          data: [],
        });
      }
    } else {
      const dashSiteData = await db.query(QuerySiteDashPast, {
        // const pland = await db.query(QueryDailyPlann, {
        replacements: {
          schDate: schDate,
          sitename: sitename,
        },
        type: QueryTypes.SELECT,
      });
      return res.status(200).json({
        success: true,
        data: dashSiteData,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

export const getDataQcSite = async (req, res) => {
  try {
    const { schDate, sitename } = req.params;

    const dataDefRateQc = await db.query(QueryDefRateSite, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
      },
      type: QueryTypes.SELECT,
    });
    return res.status(200).json({
      success: true,
      data: dataDefRateQc,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request defrate",
      data: error,
    });
  }
};

export const getDataDashSiteYestd = async (req, res) => {
  try {
    const { date, sitename } = req.params;

    const schdDateYes = findYesDate(date);

    const dataDashYest = await db.query(QuerySiteDashPast, {
      replacements: {
        schDate: schdDateYes,
        sitename: sitename,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: dataDashYest,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request defrate",
      data: error,
    });
  }
};

//fin date yesterdaye
function findYesDate(tanggal) {
  const dayName = moment(tanggal).format("dddd");
  let newDate;

  if (dayName === "Monday") {
    newDate = moment(tanggal).subtract(2, "days");
  } else {
    newDate = moment(tanggal).subtract(1, "days");
  }

  return newDate.format("YYYY-MM-DD");
}
