import express from "express";
import {
  getDataAllSiteDash,
  getDefRate,
  getEffYtdOverAll,
  getThreeTop,
  splitDataDashboard,
  sumByLine,
} from "../../controllers/production/dashAnalitycs/DashboardAll.js";
import {
  getDataDashSite,
  getDataDashSiteYestd,
  getDataQcSite,
  getRftPerhour,
  getTopDefectPart,
} from "../../controllers/production/dashAnalitycs/DashboardSite.js";
import {
  getDataWeekly,
  getYtdListWe,
} from "../../controllers/production/dashAnalitycs/DashYtd.js";
import { getDataMtd } from "../../controllers/production/dashAnalitycs/DashMtd.js";

const router = express.Router();

router.get("/allsite", getDataAllSiteDash, sumByLine, splitDataDashboard);
router.get("/effYesAll", getEffYtdOverAll);
router.get("/defRate", getDefRate);
router.get("/topthree", getThreeTop);

//site route
router.get("/sitedash/:schDate/:sitename", getDataDashSite);
router.get("/sitedash/yesterday/:schDate/:sitename", getDataDashSiteYestd);
router.get("/sitedash/defrate/:schDate/:sitename", getDataQcSite);

//detil line
router.get("/sitedash/topdefpart/:schDate/:idSiteline", getTopDefectPart);
router.get("/sitedash/defHourShift/:schDate/:idSiteLine/:shift", getRftPerhour);

//YTD route
router.get("/ytd/list-we/:year", getYtdListWe);
router.get("/ytd/weekly", getDataWeekly);
router.get("/ytd/monthly", getDataMtd);

export default router;
