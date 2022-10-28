import express from "express";
const router = express.Router();

import QRScanSewing from "../../controllers/production/sewing/SewingScan.js";



// ROUTE SEWING

router.post("/order/scan", QRScanSewing);

export default router;
