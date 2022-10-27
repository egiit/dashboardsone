import express from "express";
const router = express.Router();

import { getOrder, getOrderByBarcodeSerial, getOrderByBLK, newOrder, deleteOrder, ScanCutting } from "../../controllers/production/Cutting.js";

// ROUTE CUTTING
router.get("/order", getOrder);
router.get("/order/:barcodeserial", getOrderByBarcodeSerial);
router.get("/order/:orderno", getOrderByBLK);
router.post("/order", newOrder);
router.delete("/order/:barcodeserial", deleteOrder);
router.post("/order", ScanCutting);

export default router;
