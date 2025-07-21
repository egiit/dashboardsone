import { QueryTypes, Op } from "sequelize";
import moment from "moment";
import { queryGetMonthDash, QueryMonthRep } from "../../../models/dashAnalitycs/sewYtdDash.js";
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
import { sumData } from "./DashYtd.js";

// get data weekly
export const getSewFullYear = async (req, res) => {
  try {
    const { rangeDate, site } = req.query;

    const dates = rangeDate.split(",");
    const currentDate = moment().format("YYYY-MM-DD");
    const theYear = moment(dates[0]).format("YYYY");
    const listWeekOneYear = await getListWe(theYear);

    let queryString = `YEAR(a.SCHD_PROD_DATE) = YEAR('${dates[0]}')`;

    if (site) {
      const sites = site
        .split(",")
        .map((st) => `'${st}'`)
        .join(",");
      queryString = queryString + ` AND a.SITE_NAME IN (${sites})`;
    }

    // console.log(queryString);

    const whereQuery = QueryMonthRep(queryString);
    const monthlyDatas = await db.query(whereQuery, {
      // replacements: {
      //   capId: capData.ID_CAPACITY,
      // },
      type: QueryTypes.SELECT,
    });

    //buang current date
    const monthWithOutCurDate = monthlyDatas.filter(
      (datas) => datas.SCHD_PROD_DATE !== currentDate
    );

    //menambahan we identitas ke tiap yearData
    const yearData = monthWithOutCurDate
      .map((data) => {
        const matchingWeek = listWeekOneYear.find((week) =>
          week.rangeDate.includes(data.SCHD_PROD_DATE)
        );
        const WE = matchingWeek
          ? {
              WE: matchingWeek.id,
              WE_NAME: matchingWeek.name,
              ID_WE: matchingWeek.WE,
            }
          : {};
        return { ...data, ...WE };
      })
      .filter((we) => we.WE);

    const thisWeek = listWeekOneYear.find((week) =>
      week.rangeDate.includes(dates[0])
    );

    const dataWeek = yearData.filter((weeks) => weeks.ID_WE === thisWeek.WE);
    //filter berdasarkan month
    const thisMonth = moment(dates[0], "YYYY-MM-DD").format("MMMM/YYYY");
    // console.log({ thisMonth, thisWeek: thisWeek.WE });

    const dataMonth = yearData.filter(
      (months) => months.PRODUCTION_MONTH === thisMonth
    );

    //DATA EFF WEEK
    const totalEhWeek = SumByColoum(dataWeek, "TOTAL_EH");
    const totalAhWeek = SumByColoum(dataWeek, "TOTAL_AH");
    const totalEffWeek = JmlEff(totalEhWeek, totalAhWeek);

    //DATA EFF MONTH
    const totalEhMonth = SumByColoum(dataMonth, "TOTAL_EH");
    const totalAhMonth = SumByColoum(dataMonth, "TOTAL_AH");
    const totalEffMonth = JmlEff(totalEhMonth, totalAhMonth);

    //DATA EFF YEAR
    const totalEhYear = SumByColoum(yearData, "TOTAL_EH");
    const totalAhYear = SumByColoum(yearData, "TOTAL_AH");
    const totalEffYear = JmlEff(totalEhYear, totalAhYear);

    const dataByDate = await sumData(dataWeek, ["SCHD_PROD_DATE"]);
    const dataByWeek = await sumData(dataMonth, ["WE"]);
    const dataByMonth = await sumData(yearData, ["MONTH"]);
    const dataByDateAndSiteWeek = await sumData(dataWeek, [
      "SCHD_PROD_DATE",
      "SITE_NAME",
    ]);
    const dataByDateAndSiteMonth = await sumData(dataMonth, [
      "WE",
      "SITE_NAME",
    ]);
    const dataByDateAndSiteY = await sumData(yearData, ["MONTH", "SITE_NAME"]);

    const dataBySiteWeek = await sumData(dataWeek, ["SITE_NAME"]);
    const dataBySiteMonth = await sumData(dataMonth, ["SITE_NAME"]);
    const dataBySiteYear = await sumData(yearData, ["SITE_NAME"]);

    const dataByCustomerY = (await sumData(yearData, ["CUSTOMER_NAME"])).filter(
      (style) => style.CUSTOMER_NAME !== null
    );
    const dataByCustomerMonth = (
      await sumData(dataMonth, ["CUSTOMER_NAME"])
    ).filter((style) => style.CUSTOMER_NAME !== null);
    const dataByCustomerWeek = (
      await sumData(dataWeek, ["CUSTOMER_NAME"])
    ).filter((style) => style.CUSTOMER_NAME !== null);

    const colorsList = [
      { SITE_NAME: "SBR_01", colorSite: "#2983FF" },
      { SITE_NAME: "SBR_02A", colorSite: "#00E396" },
      { SITE_NAME: "SBR_02B", colorSite: "#FEB019" },
      { SITE_NAME: "SBR_03", colorSite: "#FF4560" },
      { SITE_NAME: "SBR_04", colorSite: "#775DD0" },
    ];
    // cari data berdasarkan site untuk chart weekly eff per date per site
    const arrySeriesSiteYear = dataBySiteYear.map((site) => ({
      name: site.CUS_NAME,
      type: "column",
      color: colorsList.filter((clr) => clr.SITE_NAME === site.SITE_NAME)[0]
        .colorSite,
      data: dataByDateAndSiteY
        .filter((dateNsite) => dateNsite.SITE_NAME === site.SITE_NAME)
        .map((val) => val.EFF?.toFixed(2)),
    }));

    const arrySeriesSiteMonth = dataBySiteMonth.map((site) => ({
      name: site.CUS_NAME,
      type: "column",
      color: colorsList.filter((clr) => clr.SITE_NAME === site.SITE_NAME)[0]
        .colorSite,
      data: dataByDateAndSiteMonth
        .filter((dateNsite) => dateNsite.SITE_NAME === site.SITE_NAME)
        .map((val) => val.EFF?.toFixed(2)),
    }));

    const arrySeriesSiteWeek = dataBySiteWeek.map((site) => ({
      name: site.CUS_NAME,
      type: "column",
      color: colorsList.filter((clr) => clr.SITE_NAME === site.SITE_NAME)[0]
        .colorSite,
      data: dataByDateAndSiteWeek
        .filter((dateNsite) => dateNsite.SITE_NAME === site.SITE_NAME)
        .map((val) => val.EFF?.toFixed(2)),
    }));

    //cari daata berdasarkan date
    const arrayDateEff = {
      name: "OVERALL EFF",
      type: "line",
      color: "#008FFB",
      data: dataByDate.map((dataDate) => dataDate.EFF?.toFixed(2)),
    };
    const arrayWeekEff = {
      name: "OVERALL EFF",
      type: "line",
      color: "#008FFB",
      data: dataByWeek.map((dataDate) => dataDate.EFF?.toFixed(2)),
    };
    const arrayMonthEff = {
      name: "OVERALL EFF",
      type: "line",
      color: "#008FFB",
      data: dataByMonth.map((dataDate) => dataDate.EFF?.toFixed(2)),
    };

    //join data series antara by site dan summary eff per date
    const dataSeriesWeek = [...arrySeriesSiteWeek, arrayDateEff];
    const dataSeriesMonth = [...arrySeriesSiteMonth, arrayWeekEff];
    const dataSeriesYear = [...arrySeriesSiteYear, arrayMonthEff];

    //storage date berdasarkan scheddule listWeek
    const listDate = dataByMonth.map((dataDate) => dataDate.SCHD_PROD_DATE);
    const listWeek = dataByMonth.map((dataDate) => dataDate.WE_NAME);
    const listMonth = dataByMonth.map((dataDate) => dataDate.PRODUCTION_MONTH);

    // ############### for table weekly summary ##############
    const startDate = moment(dates[0]);
    const endDate = moment(dates[1]);
    const rangesDates = { start: startDate, end: endDate };

    //get range date
    const weekRangeDate = getRangeDate(rangesDates);

    // ############### end for table weekly summary ##############

    res.json({
      dataByCustomerY,
      dataByCustomerMonth,
      dataByCustomerWeek,
      dataSeriesWeek,
      dataSeriesMonth,
      dataSeriesYear,
      dataBySiteWeek,
      dataBySiteMonth,
      dataBySiteYear,
      totalEhWeek,
      totalAhWeek,
      totalEffWeek,
      totalEhMonth,
      totalAhMonth,
      totalEffMonth,
      totalEhYear,
      totalAhYear,
      totalEffYear,
      listDate,
      listWeek,
      listMonth,
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Data weekly Ditemukan", error });
  }
};

// Get List We
export const getListWe = async (year) => {
  try {
    const yr = year;
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
      const rangesDates = { start: startDate, end: endDate };

      //get range date
      const weekRangeDate = getRangeDate(rangesDates);
      arrWeek.push({
        id: we,
        value: { startDate, endDate },
        rangeDate: weekRangeDate,
        WE: `WE${idx}`,
        name: `WE${idx} (${startWeek}/${dateWeek})`,
      });
      we++;

      weekEndYear = theWeek.day("Saturday").format("YYYY");
    }
    return arrWeek;
  } catch (error) {
    return [];
  }
};


export const getReportMonth = async (req, res) => {
  try {
    const { dates } = req.params;
    
    const monthlyDatas = await db.query(queryGetMonthDash, {
      replacements : {dates},
      type: QueryTypes.SELECT,
    });

    const unixSite = [...new Set(monthlyDatas.map(item => item['CUS_NAME']))];
    
      const structurData = unixSite.map(item => {
       
        const data = monthlyDatas.filter(month => month['CUS_NAME'] === item);
        const dataDate = data.map(date => moment(date.SCHD_PROD_DATE, 'YYYY-MM-DD').format('MMM-DD'))
        const dataEff = data.map(eff => eff.EFF ? eff.EFF.toFixed(2) : "0")
        const dataTotPut = data.map(qty => qty.TOTAL_OUTPUT)

        const category = dataDate
        const series = [
          {
            name: "Output Qty",
            type: "column",
            data: dataTotPut,
          },
          {
            name: "Efficiency (%)",
            type: "line",
            data: dataEff,
          }
        ]
         return {site : item, category, series}

      })

      // console.log(structurData);
      
    return res.status(200).json({ data : structurData });
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({ message: "Somthing when wrong" });
  }
} 