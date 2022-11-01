import express from "express";
const router = express.Router();

// import { getOrder, getOrderByBarcodeSerial, getOrderByBLK } from "../../controllers/production/cutting/CuttingGetOrder.js";
// import newOrder from "../../controllers/production/cutting/CuttingNewOrder.js";
// import deleteOrder from "../../controllers/production/cutting/CuttingDeleteOrder.js";
import { getOrder, getOrderByBarcodeSerial, getOrderByBLK, newOrder, deleteOrder } from "../../controllers/production/order/OrderDetail.js";
import QRScanCutting from "../../controllers/production/cutting/CuttingScan.js";



// ROUTE CUTTING

router.post("/order/scan", QRScanCutting);

export default router;
