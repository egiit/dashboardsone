import express from "express";
import {
  getDataAllSiteDash,
  getDefRate,
  getEffYtdOverAll,
  getThreeTop,
  splitDataDashboard,
} from "../../controllers/production/dashAnalitycs/DashboardAll.js";
import {
  getDataDashSite,
  getDataDashSiteYestd,
  getDataQcSite,
  getRftPerhour,
  getTopDefectPart,
} from "../../controllers/production/dashAnalitycs/DashboardSite.js";

const router = express.Router();

router.get("/allsite", getDataAllSiteDash, splitDataDashboard);
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

export default router;
