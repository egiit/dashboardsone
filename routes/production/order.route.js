import express from "express";
const router = express.Router();

import { getOrder, getOrderByBarcodeSerial, getOrderByBLK, newOrder, deleteOrder } from "../../controllers/production/order/OrderDetail.js";
import { getOrderPOListing } from "../../controllers/production/order/OrderPOListing.js";

router.get("/detail", getOrder);
router.get("/detail/barcodeserial/:barcodeserial", getOrderByBarcodeSerial);
router.get("/detail/ordernumber/:orderno", getOrderByBLK);

router.post("/detail", newOrder);
router.delete("/detail/delete/:barcodeserial", deleteOrder);

router.get("/polisting", getOrderPOListing);

export default router;
