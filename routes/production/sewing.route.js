import express from "express";
const router = express.Router();

import QRScanSewing from "../../controllers/production/sewing/SewingScan.js";
import {
  getListLine,
  getSiteList,
} from "../../controllers/production/sewing/SiteLine.js";

// ROUTE SEWING
router.get("/sitelist", getSiteList);
router.get("/listLine", getListLine);
router.post("/order/scan", QRScanSewing);

export default router;
