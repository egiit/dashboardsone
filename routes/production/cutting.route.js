import express from "express";
const router = express.Router();

import QRScanCutting from "../../controllers/production/cutting/CuttingScan.js";
import { newQRCutting } from "../../controllers/production/cutting/CuttingGenerateQR.js";
import {
  getCuttingOrder,
  getOrderByBLK,
} from "../../controllers/production/cutting/CuttingGetOrder.js";

// ROUTE CUTTING

router.get("/order/list/:startDate/:endDate", getCuttingOrder);
router.get("/order/bundle/:orderNo", getOrderByBLK);

router.post("/order/qrgenerate", newQRCutting);
router.post("/order/scan", QRScanCutting);

export default router;
