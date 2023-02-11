import express from "express";
import {
  getDailyPlanPackIn,
  QrListAftrPackingIn,
  ScanPackingQrIn,
} from "../../controllers/production/packing/PackingScan.js";
const router = express.Router();

router.get(
  "/qr/scanin-result/:scanDate/:linename/:barcodeserial",
  QrListAftrPackingIn
);
router.get("/scanin/daily-schedule/:schDate", getDailyPlanPackIn);

router.post("/qr/scanin", ScanPackingQrIn);

export default router;
