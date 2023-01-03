import express from "express";
import {
  getManpowerPlanVsActual,
  postRegenerateMp,
  updateManpowerDefault,
} from "../../controllers/production/sewing/SewingManpower.js";
const router = express.Router();

import QRScanSewing from "../../controllers/production/sewing/SewingScan.js";
import {
  getListSmvHeader,
  getSewingSmvDetail,
  postSewingSmvDetail,
  postSewingSmvHeader,
} from "../../controllers/production/sewing/SewingSmv.js";
import {
  postDailyWh,
  postWhMpOt,
} from "../../controllers/production/sewing/SewingWhDetial.js";
import {
  getListLine,
  getListLineByGroup,
  getSiteList,
} from "../../controllers/production/sewing/SiteLine.js";

// ROUTE SEWING
router.get("/sitelist", getSiteList);
router.get("/listLine", getListLine);
router.get("/listLineBuGroup", getListLineByGroup);
router.get("/smvlist", getListSmvHeader);
router.get("/sewingsmvdetail/:orderNO", getSewingSmvDetail);
router.get("/manpower-detail/:date/:site/:shift", getManpowerPlanVsActual);

router.post("/sewingsmv", postSewingSmvHeader);
router.post("/sewingsmvdetail", postSewingSmvDetail);
router.post("/sewing-mp/generate", postRegenerateMp);
router.post("/sewing-wh-detail/", postDailyWh);
router.post("/order/scan", QRScanSewing);
router.post("/ot-mp-wh/", postWhMpOt);

router.patch("/sewing-mp/", updateManpowerDefault);

export default router;
