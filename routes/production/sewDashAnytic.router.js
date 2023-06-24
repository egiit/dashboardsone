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

export default router;
