import express from "express";
const router = express.Router();

import {
  DelQrScanSewIN,
  QrListAftrSewingIn,
  QRScanCutting,
  QRScanSewingIn,
} from "../../controllers/production/cutting/CuttingScan.js";
import { newQRCutting } from "../../controllers/production/cutting/CuttingGenerateQR.js";
import {
  getCuttingOrder,
  getOrderByBLK,
} from "../../controllers/production/cutting/CuttingGetOrder.js";

// ROUTE CUTTING

router.get("/order/list/:startDate/:endDate", getCuttingOrder);
router.get("/order/bundle/:orderNo", getOrderByBLK);
router.get(
  "/qr/scan-sewing-in/:schDate/:sitename/:barcodeserial",
  QrListAftrSewingIn
);

router.post("/order/qrgenerate", newQRCutting);
router.post("/order/scan", QRScanCutting);
router.post("/qr/scan-sewing-in", QRScanSewingIn);

router.delete("/qr/scan-sewing-in/:barcodeserial", DelQrScanSewIN);
export default router;
