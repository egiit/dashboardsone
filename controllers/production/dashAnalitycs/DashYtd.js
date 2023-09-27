import { QueryTypes, Op } from "sequelize";
import moment from "moment";
import { QueryWeekRep } from "../../../models/dashAnalitycs/sewYtdDash.js";
import db from "../../../config/database.js";
import {
  CheckNilai,
  ChkNilaFlt,
  CompareBy,
  JmlEff,
  SumByColoum,
} from "../../util/Utility.js";

// Get List We
export const getYtdListWe = async (req, res) => {
  try {
    const yr = req.params.year;
    let we = 0;
    let arrWeek = [];
    let thisYear = moment(yr).get("year") + 1;
    let weekEndYear = moment(yr).get("year");

    while (parseInt(weekEndYear) < thisYear) {
      let theWeek = moment(yr).week(we + 1);
      let startDate = theWeek
        .day("Saturday")
        .day("Saturday")
        .subtract(5, "days")
        .format("YYYY-MM-DD");
      let endDate = theWeek.day("Saturday").format("YYYY-MM-DD");
      let startWeek = theWeek
        .day("Saturday")
        .subtract(5, "days")
        .format("DD-MMM");
      let dateWeek = theWeek
        .day("Saturday")
        // .subtract(7, "days")
        .format("DD-MMM");
      //   let monthWeek = theWeek.day("Saturday").format("MM");
      let idx = we < 9 ? `0${we + 1}` : we;
      arrWeek.push({
        id: we,
        value: { startDate, endDate },
        name: `WE${idx} (${startWeek}/${dateWeek})`,
      });
      we++;

      weekEndYear = theWeek.day("Saturday").format("YYYY");
    }
    res.json(arrWeek);
  } catch (error) {
    res.json({ message: "Data List WeekEnding Tidak Ditemukan", error });
  }
};

// get data weekly
export const getDataWeekly = async (req, res) => {
  try {
    const { rangeDate, site, shift, customers } = req.query;
    const dates = rangeDate.split(",");
    let queryString = `a.SCHD_PROD_DATE BETWEEN '${dates[0]}' AND '${dates[1]}'`;

    if (site) {
      const sites = site.split(",");
      queryString = queryString + ` AND a.SITE_NAME IN (${sites})`;
    }
    if (shift) {
      const shifts = site.split(",");
      queryString = queryString + ` AND a.SHIFT IN (${shifts})`;
    }
    if (customers) {
      const customerx = site.split(",");
      queryString = queryString + ` AND a.CUSTOMER_NAME IN (${customerx})`;
    }
    const whereQuery = QueryWeekRep(queryString);
    const weeklyData = await db.query(whereQuery, {
      // replacements: {
      //   capId: capData.ID_CAPACITY,
      // },
      type: QueryTypes.SELECT,
    });

    const totalSchQty = SumByColoum(weeklyData, "SCHD_QTY");
    const totalTarget = SumByColoum(weeklyData, "TOTAL_TARGET");
    const totalOuput = SumByColoum(weeklyData, "TOTAL_OUTPUT");
    const totalEh = SumByColoum(weeklyData, "TOTAL_EH");
    const totalAh = SumByColoum(weeklyData, "TOTAL_AH");
    const totalNormal = SumByColoum(weeklyData, "NORMAL_OUTPUT");
    const totalOt = SumByColoum(weeklyData, "OT_OUTPUT");
    const totalXot = SumByColoum(weeklyData, "X_OT_OUTPUT");
    const totalNormalEh = SumByColoum(weeklyData, "ACTUAL_EH");
    const totalOtEh = SumByColoum(weeklyData, "ACTUAL_EH_OT");
    const totalXotEh = SumByColoum(weeklyData, "ACTUAL_EH_X_OT");
    const totalNormalAh = SumByColoum(weeklyData, "ACTUAL_AH");
    const totalOtAh = SumByColoum(weeklyData, "ACTUAL_AH_OT");
    const totalXotAh = SumByColoum(weeklyData, "ACTUAL_AH_X_OT");
    const totalNormalEff = JmlEff(totalNormalEh, totalNormalAh);
    const totalOtEff = JmlEff(totalOtEh, totalOtAh);
    const totalXOtEff = JmlEff(totalXotEh, totalXotAh);
    const totalEff = JmlEff(totalEh, totalAh);
    const varTarget = totalOuput - totalTarget;
    const varSchedule = totalOuput - totalSchQty;

    const dataByDate = await sumData(weeklyData, "SCHD_PROD_DATE");
    const dataBySite = await sumData(weeklyData, "SITE_NAME");
    const dataByLine = await sumData(weeklyData, "ID_SITELINE");
    const dataByCustomer = await sumData(weeklyData, "CUSTOMER_NAME");

    res.json({
      dataByDate,
      dataBySite,
      dataByCustomer,
      dataByLine,
      dataTotal: {
        totalSchQty,
        totalTarget,
        totalOuput,
        totalEh,
        totalAh,
        totalEff,
        varTarget,
        varSchedule,
        totalNormal,
        totalOt,
        totalXot,
        totalNormalEh,
        totalOtEh,
        totalXotEh,
        totalNormalAh,
        totalOtAh,
        totalXotAh,
        totalNormalEff,
        totalOtEff,
        totalXOtEff,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Data weekly Ditemukan", error });
  }
};

//sumary data by line
export const sumData = async (data, key) => {
  const dataByLine = [
    ...data
      .reduce((distLine, current) => {
        const attrib = current[key];
        const grouped = distLine.get(attrib);
        // console.log(grouped);
        if (!grouped) {
          distLine.set(attrib, {
            ...current,
            SCHD_QTY: CheckNilai(current.SCHD_QTY),
            TOTAL_TARGET: ChkNilaFlt(current.TOTAL_TARGET),
            TOTAL_OUTPUT: CheckNilai(current.TOTAL_OUTPUT),
            TOTAL_EH: ChkNilaFlt(current.TOTAL_EH),
            TOTAL_AH: CheckNilai(current.TOTAL_AH),
            ACT_TARGET: ChkNilaFlt(current.ACT_TARGET),
            ACT_TARGET_OT: ChkNilaFlt(current.ACT_TARGET_OT),
            ACT_TARGET_X_OT: ChkNilaFlt(current.ACT_TARGET_X_OT),
            NORMAL_OUTPUT: CheckNilai(current.NORMAL_OUTPUT),
            OT_OUTPUT: CheckNilai(current.OT_OUTPUT),
            X_OT_OUTPUT: CheckNilai(current.X_OT_OUTPUT),
          });
        } else {
          distLine.set(attrib, {
            ...grouped,
            SCHD_QTY:
              CheckNilai(grouped.SCHD_QTY) + CheckNilai(current.SCHD_QTY),
            TOTAL_TARGET:
              ChkNilaFlt(grouped.TOTAL_TARGET) +
              ChkNilaFlt(current.TOTAL_TARGET),
            TOTAL_OUTPUT:
              CheckNilai(grouped.TOTAL_OUTPUT) +
              CheckNilai(current.TOTAL_OUTPUT),
            TOTAL_EH:
              ChkNilaFlt(grouped.TOTAL_EH) + ChkNilaFlt(current.TOTAL_EH),
            TOTAL_AH:
              CheckNilai(grouped.TOTAL_AH) + CheckNilai(current.TOTAL_AH),
            ACT_TARGET:
              ChkNilaFlt(grouped.ACT_TARGET) + ChkNilaFlt(current.ACT_TARGET),
            ACT_TARGET_OT:
              ChkNilaFlt(grouped.ACT_TARGET_OT) +
              ChkNilaFlt(current.ACT_TARGET_OT),
            ACT_TARGET_X_OT:
              ChkNilaFlt(grouped.ACT_TARGET_X_OT) +
              ChkNilaFlt(current.ACT_TARGET_X_OT),
            NORMAL_OUTPUT:
              CheckNilai(grouped.NORMAL_OUTPUT) +
              CheckNilai(current.NORMAL_OUTPUT),
            OT_OUTPUT:
              CheckNilai(grouped.OT_OUTPUT) + CheckNilai(current.OT_OUTPUT),
            X_OT_OUTPUT:
              CheckNilai(grouped.X_OT_OUTPUT) + CheckNilai(current.X_OT_OUTPUT),
          });
        }

        return distLine;
      }, new Map())
      .values(),
  ].map((sum) => ({
    ...sum,
    VAR_SCHD: CheckNilai(sum.TOTAL_OUTPUT - sum.SCHD_QTY),
    VAR_TARGET: ChkNilaFlt(sum.TOTAL_OUTPUT - sum.TOTAL_TARGET),
    EFF: JmlEff(sum.TOTAL_EH, sum.TOTAL_AH),
  }));

  dataByLine.sort((a, b) => CompareBy(a, b, key));
  return dataByLine;
};
