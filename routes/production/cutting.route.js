import express from "express";
const router = express.Router();

// import { getOrder, getOrderByBarcodeSerial, getOrderByBLK } from "../../controllers/production/cutting/CuttingGetOrder.js";
// import newOrder from "../../controllers/production/cutting/CuttingNewOrder.js";
// import deleteOrder from "../../controllers/production/cutting/CuttingDeleteOrder.js";

import QRScanCutting from "../../controllers/production/cutting/CuttingScan.js";
import {
  getCutingOrder,
  getOrderByBLK,
} from "../../controllers/production/cutting/CuttingGetOrder.js";

// ROUTE CUTTING

router.get("/order/list", getCutingOrder);
router.get("/order/bundle/:orderNo", getOrderByBLK);
router.post("/order/scan", QRScanCutting);

export default router;
