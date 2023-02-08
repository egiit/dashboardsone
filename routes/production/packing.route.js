import express from "express";
import { ScanPackingQrIn } from "../../controllers/production/packing/PackingScan.js";
const router = express.Router();

router.post("/qr/scanin", ScanPackingQrIn);

export default router;
