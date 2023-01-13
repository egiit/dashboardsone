import express from "express";
import { getWorkerDoneRep } from "../../controllers/production/reports/WorkerdoneRep.js";
const router = express.Router();

router.get("/workerdone/:scanDate", getWorkerDoneRep);

export default router;
