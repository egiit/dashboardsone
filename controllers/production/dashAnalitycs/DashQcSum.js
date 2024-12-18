import { QueryTypes, Op } from "sequelize";
import moment from "moment";
import db from "../../../config/database.js";
import {
  CheckNilai,
  ChkNilaFlt,
  CompareBy,
  JmlEff,
  SumByColoum,
  getRangeDate,
  roundNumber,
} from "../../util/Utility.js";
import {
  QueryQcDash,
  QueryQcDefPart,
  SQLTopDefectLineYes,
  SQLTopPartLineYes,
} from "../../../models/dashAnalitycs/qcDayDash.mod.js";
import { QueryFindTarget } from "../../../models/dashAnalitycs/mainDashSew.js";
import { sumDataQc, sumDefOrPart } from "./DashQcDay.js";

//get data qc dashboard
export const getDataQcSum = async (req, res) => {
  try {
    const {
      rangeDate,
      site,
      shift,
      customers,
      style,
      line,
      defCode,
      partCode,
    } = req.query;

    const dates = rangeDate.split(",");
    // const currentDate = moment().format("YYYY-MM-DD");

    let queryString = `a.SCHD_PROD_DATE BETWEEN '${dates[0]}' AND '${dates[1]}'`;
    let querySelDefPart = false;
    if (site) {
      const sites = site
        .split(",")
        .map((st) => `'${st}'`)
        .join(",");
      queryString = queryString + ` AND a.SITE_NAME IN (${sites})`;
    }
    if (shift) {
      const shifts = shift
        .split(",")
        .map((st) => `'${st}'`)
        .join(",");
      queryString = queryString + ` AND a.SHIFT IN (${shifts})`;
    }
    if (customers) {
      const customerx = customers
        .split("-")
        .map((cust) => `'${decodeURIComponent(cust)}'`)
        .join(",");
      queryString = queryString + ` AND a.CUSTOMER_NAME IN (${customerx})`;
    }
    if (style) {
      const styles = style
        .split(",")
        .map((stl) => `'${decodeURIComponent(stl)}'`)
        .join(",");
      queryString = queryString + ` AND a.PRODUCT_ITEM_CODE IN (${styles})`;
    }

    if (line) {
      const lines = line
        .split(",")
        .map((st) => `'${st}'`)
        .join(",");
      queryString = queryString + ` AND a.ID_SITELINE IN (${lines})`;
    }

    if (!partCode && defCode) {
      const partDefString = `AND a.SCHD_ID IN (
        SELECT DISTINCT a.ENDLINE_ACT_SCHD_ID
        FROM  qc_endline_output a 
        WHERE  a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL 
        AND DATE(a.ENDLINE_ADD_TIME) BETWEEN '${dates[0]}' AND '${dates[1]}' 
        AND a.ENDLINE_DEFECT_CODE = '${defCode}'
        GROUP BY a.ENDLINE_ACT_SCHD_ID
      )`;
      querySelDefPart = queryString + partDefString;
      queryString = queryString + `AND b.ENDLINE_DEFECT_CODE = '${defCode}'`;
    }

    if (partCode && !defCode) {
      const partDefString = `AND a.SCHD_ID IN (
        SELECT DISTINCT a.ENDLINE_ACT_SCHD_ID
        FROM  qc_endline_output a 
        WHERE  a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL 
        AND DATE(a.ENDLINE_ADD_TIME) BETWEEN '${dates[0]}' AND '${dates[1]}'
        AND a.ENDLINE_PART_CODE = '${partCode}'
        GROUP BY a.ENDLINE_ACT_SCHD_ID
      )`;
      querySelDefPart = queryString + partDefString;
      queryString = queryString + `AND b.ENDLINE_PART_CODE = '${partCode}'`;
    }

    if (partCode && defCode) {
      const partDefString = `AND a.SCHD_ID IN (
        SELECT DISTINCT a.ENDLINE_ACT_SCHD_ID
        FROM  qc_endline_output a 
        WHERE  a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL 
        AND DATE(a.ENDLINE_ADD_TIME) BETWEEN '${dates[0]}' AND '${dates[1]}'
        AND a.ENDLINE_DEFECT_CODE = '${defCode}'
        AND a.ENDLINE_PART_CODE = '${partCode}'
        GROUP BY a.ENDLINE_ACT_SCHD_ID
      )`;
      querySelDefPart = queryString + partDefString;
      queryString =
        queryString +
        `AND b.ENDLINE_DEFECT_CODE = '${defCode}' AND b.ENDLINE_PART_CODE = '${partCode}'`;
    }

    const newQueryString = querySelDefPart ? querySelDefPart : queryString;
    const whereQuery = QueryQcDash(newQueryString);

    const whereQueryDefPart = QueryQcDefPart(queryString);

    const qcDashData = await db.query(whereQuery, {
      type: QueryTypes.SELECT,
    });

    const qcDashDataDefPart = await db.query(whereQueryDefPart, {
      type: QueryTypes.SELECT,
    });

    const totalTarget = SumByColoum(qcDashData, "TOTAL_TARGET");
    const totalChecked = SumByColoum(qcDashData, "CHECKED");
    const totalGood = SumByColoum(qcDashData, "GOOD");
    const totalRFT = SumByColoum(qcDashData, "RFT");
    const totalDefect = SumByColoum(qcDashData, "DEFECT");
    const totalRepaired = SumByColoum(qcDashData, "REPAIRED");
    const totalBS = SumByColoum(qcDashData, "BS");
    const percentRFT = ChkNilaFlt((totalRFT / totalChecked) * 100);
    const percentDefect = ChkNilaFlt((totalDefect / totalChecked) * 100);
    const percentRepaired = ChkNilaFlt((totalRepaired / totalDefect) * 100);
    const percentBS = ChkNilaFlt((totalBS / totalChecked) * 100);

    const dataBySite = await sumDataQc(qcDashData, ["SITE_NAME"]);
    const dataByDate = await sumDataQc(qcDashData, ["SCHD_PROD_DATE"]);
    const dataBySiteDate = await sumDataQc(qcDashData, [
      "SCHD_PROD_DATE",
      "SITE_NAME",
    ]);

    const dataByLine = (await sumDataQc(qcDashData, ["ID_SITELINE"])).map(
      (line) => ({
        ...line,
        CUS_LINE_NAME:
          line.SHIFT === "Shift_B"
            ? `${line.CUS_NAME}-${line.LINE_NAME}B`
            : `${line.CUS_NAME}-${line.LINE_NAME}`,
        LINE_NAME_SHIFT:
          line.SHIFT === "Shift_B" ? `${line.LINE_NAME}B` : `${line.LINE_NAME}`,
      })
    );

    const dataByCustomer = (
      await sumDataQc(qcDashData, ["CUSTOMER_NAME"])
    ).filter((style) => style.CUSTOMER_NAME !== null);
    const dataByStyle = await sumDataQc(qcDashData, ["PRODUCT_ITEM_CODE"]);

    let topTenStyle = [];
    //jika data by style lebih dari 10 maka slice untuk top ten dan bottom ten
    if (dataByStyle.length > 0) {
      const dataStyleSortEffTop = [
        ...dataByStyle.sort((a, b) => CompareBy(b, a, "percentDefect")),
      ];

      topTenStyle = dataStyleSortEffTop?.slice(0, 9);
    }

    //TOP 3 DEFECT AND PART
    const fullDefect = (
      await sumDefOrPart(qcDashDataDefPart, ["DEFECT_CODE"])
    )?.map((def) => ({
      DEFECT_CODE: def.DEFECT_CODE,
      DEFECT_NAME: def.DEFECT_NAME,
      DEFECT_QTY: def.DEFECT_QTY,
    }));

    const dataTop3Def = fullDefect?.slice(0, 5);

    const dataTop3Part = (await sumDefOrPart(qcDashDataDefPart, ["PART_CODE"]))
      ?.map((part) => ({
        PART_CODE: part.PART_CODE,
        PART_NAME: part.PART_NAME,
        DEFECT_QTY: part.DEFECT_QTY,
      }))
      ?.slice(0, 5);

      //ambil data top 5 line with defect rate tiap Site
      let chartTop5Line = []
    if (dataBySite && dataByLine) {
      const dataHiLine = dataBySite.map((item) => {
        const dataline = dataByLine
          .filter((len) => len.SITE_NAME === item.SITE_NAME)
          ?.map((itm) => ({
            ID_SITELINE: itm.ID_SITELINE,
            SITE_NAME: itm.SITE_NAME,
            LINE_NAME: itm.LINE_NAME,
            percentDefect: itm.percentDefect,
          }));
          
        dataline.sort((a, b) => b.percentDefect - a.percentDefect);

        const data5 = dataline.slice(0, 5);

        const dataEachSite = {
          SITE_NAME: item.SITE_NAME,
          CUS_NAME: item.CUS_NAME,
          dataChart: data5,
        };

        return dataEachSite;
      });

      chartTop5Line = dataHiLine || []
    }
    res.json({
      dataBySite,
      dataByCustomer,
      dataByLine,
      dataByStyle,
      dataByDate,
      dataBySiteDate,
      topTenStyle,
      dataTop3Def,
      dataTop3Part,
      chartTop5Line,
      fullDefect,
      dataTotal: {
        totalTarget,
        totalChecked,
        totalRFT,
        totalGood,
        totalDefect,
        totalRepaired,
        totalBS,
        percentRFT,
        percentDefect,
        percentRepaired,
        percentBS,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Data weekly Ditemukan", error });
  }
};
