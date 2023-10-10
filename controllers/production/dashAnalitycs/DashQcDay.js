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

//get data qc dashboard
export const getDataQcDash = async (req, res) => {
  try {
    const {
      rangeDate,
      site,
      shift,
      customers,
      style,
      // line,
      defCode,
      partCode,
    } = req.query;

    const dates = rangeDate.split(",");
    const currentDate = moment().format("YYYY-MM-DD");

    let queryString = `a.SCHD_PROD_DATE = '${dates[0]}'`;
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

    if (!partCode && defCode) {
      const partDefString = `AND a.SCHD_ID IN (
        SELECT DISTINCT a.ENDLINE_ACT_SCHD_ID
        FROM  qc_endline_output a 
        WHERE  a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL 
        AND DATE(a.ENDLINE_ADD_TIME) = '${dates[0]}'
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
        AND DATE(a.ENDLINE_ADD_TIME) = '${dates[0]}'
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
        AND DATE(a.ENDLINE_ADD_TIME) = '${dates[0]}'
        AND a.ENDLINE_DEFECT_CODE = '${defCode}'
        AND a.ENDLINE_PART_CODE = '${partCode}'
        GROUP BY a.ENDLINE_ACT_SCHD_ID
      )`;
      querySelDefPart = queryString + partDefString;
      queryString =
        queryString +
        `AND b.ENDLINE_DEFECT_CODE = '${defCode}' AND b.ENDLINE_PART_CODE = '${partCode}'`;
    }

    // if (line) {
    //   const lines = line
    //     .split(",")
    //     .map((st) => `'${st}'`)
    //     .join(",");
    //   queryString = queryString + ` AND a.ID_SITELINE IN (${lines})`;
    // }
    // console.log(queryString);
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
    const dataTop3Def = (
      await sumDefOrPart(qcDashDataDefPart, ["DEFECT_CODE"])
    )?.map((def) => ({
      DEFECT_CODE: def.DEFECT_CODE,
      DEFECT_NAME: def.DEFECT_NAME,
      DEFECT_QTY: def.DEFECT_QTY,
    }));

    const dataTop3Part = (
      await sumDefOrPart(qcDashDataDefPart, ["PART_CODE"])
    )?.map((part) => ({
      PART_CODE: part.PART_CODE,
      PART_NAME: part.PART_NAME,
      DEFECT_QTY: part.DEFECT_QTY,
    }));

    res.json({
      dataBySite,
      dataByCustomer,
      dataByLine,
      dataByStyle,
      topTenStyle,
      dataTop3Def,
      dataTop3Part,
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

//summary QC
export const sumDataQc = async (data, keys) => {
  const dataSum = [
    ...data
      .reduce((distLine, current) => {
        const groupKey = keys.map((key) => current[key]).join("_"); // Create a combined key
        const grouped = distLine.get(groupKey);
        // console.log(grouped);
        if (!grouped) {
          distLine.set(groupKey, {
            ...current,
            TOTAL_TARGET: ChkNilaFlt(current.TOTAL_TARGET),
            TOTAL_OUTPUT: ChkNilaFlt(current.TOTAL_OUTPUT),
            CHECKED: CheckNilai(current.CHECKED),
            GOOD: CheckNilai(current.GOOD),
            RFT: CheckNilai(current.RFT),
            DEFECT: CheckNilai(current.DEFECT),
            REPAIRED: CheckNilai(current.REPAIRED),
            BS: CheckNilai(current.BS),
          });
        } else {
          distLine.set(groupKey, {
            ...grouped,
            TOTAL_TARGET:
              ChkNilaFlt(grouped.TOTAL_TARGET) +
              ChkNilaFlt(current.TOTAL_TARGET),

            TOTAL_OUTPUT:
              ChkNilaFlt(grouped.TOTAL_OUTPUT) +
              ChkNilaFlt(current.TOTAL_OUTPUT),
            GOOD: CheckNilai(grouped.GOOD) + CheckNilai(current.GOOD),
            CHECKED: CheckNilai(grouped.CHECKED) + CheckNilai(current.CHECKED),
            RFT: CheckNilai(grouped.RFT) + CheckNilai(current.RFT),
            DEFECT: CheckNilai(grouped.DEFECT) + CheckNilai(current.DEFECT),
            REPAIRED:
              CheckNilai(grouped.REPAIRED) + CheckNilai(current.REPAIRED),
            BS: CheckNilai(grouped.BS) + CheckNilai(current.BS),
          });
        }

        return distLine;
      }, new Map())
      .values(),
  ].map((sum) => ({
    ...sum,
    percentRFT: ChkNilaFlt((sum.RFT / sum.CHECKED) * 100),
    percentDefect: ChkNilaFlt((sum.DEFECT / sum.CHECKED) * 100),
    percentRepaired: ChkNilaFlt((sum.REPAIRED / sum.DEFECT) * 100),
    percentBS: ChkNilaFlt((sum.BS / sum.RFT) * 100),
  }));

  keys.forEach((key) => {
    dataSum.sort((a, b) => CompareBy(a, b, key));
  });

  return dataSum;
};

//sum defect or part code
export const sumDefOrPart = async (data, keys) => {
  const dataSum = [
    ...data
      .reduce((distLine, current) => {
        const groupKey = keys.map((key) => current[key]).join("_"); // Create a combined key
        const grouped = distLine.get(groupKey);
        // console.log(grouped);
        if (!grouped) {
          distLine.set(groupKey, {
            ...current,
            DEFECT_QTY: CheckNilai(current.DEFECT_QTY),
          });
        } else {
          distLine.set(groupKey, {
            ...grouped,
            DEFECT_QTY:
              CheckNilai(grouped.DEFECT_QTY) + CheckNilai(current.DEFECT_QTY),
          });
        }

        return distLine;
      }, new Map())
      .values(),
  ];

  //short dari yang terbesar
  dataSum.sort((a, b) => CompareBy(b, a, "DEFECT_QTY"));
  const top5 = dataSum?.slice(0, 5);

  // lalu ambil 5 besar
  return top5;
};

export const getTopDefectPartYes = async (req, res) => {
  try {
    const { schDate, idSiteline } = req.params;

    const dataTop3Defect = await db.query(SQLTopDefectLineYes, {
      replacements: { schDate, idSiteline },
      type: QueryTypes.SELECT,
    });
    const dataTop3Part = await db.query(SQLTopPartLineYes, {
      replacements: { schDate, idSiteline },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      message: `Get Top 3 Defect Success for Line !`,
      data: { dataTop3Defect, dataTop3Part },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};
