import express from "express";
const router = express.Router();

import { getOrder, getOrderByBarcodeSerial, getOrderByBLK } from "../../controllers/production/cutting/CuttingGetOrder.js";
import newOrder from "../../controllers/production/cutting/CuttingNewOrder.js";
import deleteOrder from "../../controllers/production/cutting/CuttingDeleteOrder.js";
import QRScanCutting from "../../controllers/production/cutting/CuttingScan.js";



// ROUTE CUTTING
router.get("/order", getOrder);
router.get("/order/barcodeserial/:barcodeserial", getOrderByBarcodeSerial);
router.get("/order/ordernumber/:orderno", getOrderByBLK);

router.post("/order", newOrder);
router.delete("/order/delete/:barcodeserial", deleteOrder);

router.post("/order/scan", QRScanCutting);

export default router;
