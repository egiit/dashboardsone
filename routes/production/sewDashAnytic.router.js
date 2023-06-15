import express from "express";
import {
  getDataAllSiteDash,
  getDefRate,
  getEffYtdOverAll,
  getThreeTop,
  splitDataDashboard,
} from "../../controllers/production/dashAnalitycs/DashboardAll.js";
const router = express.Router();

router.get("/allsite", getDataAllSiteDash, splitDataDashboard);
router.get("/effYesAll", getEffYtdOverAll);
router.get("/defRate", getDefRate);
router.get("/topthree", getThreeTop);

export default router;
