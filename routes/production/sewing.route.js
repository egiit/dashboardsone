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
router.post("/order/scan", QRScanSewing);

router.patch("/sewing-mp/", updateManpowerDefault);

export default router;
