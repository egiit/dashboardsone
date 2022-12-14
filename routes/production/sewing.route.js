import express from "express";
const router = express.Router();

import QRScanSewing from "../../controllers/production/sewing/SewingScan.js";
import {
  getListSmvHeader,
  postSewingSmvHeader,
} from "../../controllers/production/sewing/SewingSmv.js";
import {
  getListLine,
  getSiteList,
} from "../../controllers/production/sewing/SiteLine.js";

// ROUTE SEWING
router.get("/sitelist", getSiteList);
router.get("/listLine", getListLine);
router.get("/smvlist", getListSmvHeader);

router.post("/sewingsmv", postSewingSmvHeader);
router.post("/order/scan", QRScanSewing);

export default router;
