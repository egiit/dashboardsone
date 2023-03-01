import express from "express";
import {
  getSewDayRepSchd,
  getSewDayRepSize,
} from "../../controllers/production/reports/SewOutDayRep.js";
import { getWorkerDoneRep } from "../../controllers/production/reports/WorkerdoneRep.js";
const router = express.Router();

router.get("/workerdone/:startDate/:endDate", getWorkerDoneRep);
router.get("/sewing-day-ouput/:schDate/:sitename/:shift", getSewDayRepSchd);
router.get(
  "/sewing-day-ouput-size/:schDate/:sitename/:shift",
  getSewDayRepSize
);

export default router;
