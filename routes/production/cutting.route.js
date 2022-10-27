import express from "express";
const router = express.Router();

import { getOrder, getOrderByBarcodeSerial, getOrderByBLK, newOrder, deleteOrder, QRScanCutting } from "../../controllers/production/Cutting.js";

// ROUTE CUTTING
router.get("/order", getOrder);
router.get("/order/:barcodeserial", getOrderByBarcodeSerial);
router.get("/order/:orderno", getOrderByBLK);
router.post("/order/new", newOrder);
router.delete("/order/delete/:barcodeserial", deleteOrder);
router.post("/order/scan", QRScanCutting);

export default router;
