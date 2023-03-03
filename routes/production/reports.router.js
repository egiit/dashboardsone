import express from "express";
import {
  getSewDayRepPO,
  getSewDayRepSchd,
  getSewDayRepSize,
  getSewDayRepSizePo,
} from "../../controllers/production/reports/SewOutDayRep.js";
import { getWorkerDoneRep } from "../../controllers/production/reports/WorkerdoneRep.js";
const router = express.Router();

router.get("/workerdone/:startDate/:endDate", getWorkerDoneRep);

// sewing dayli output report
router.get("/sewing-day-ouput/:schDate/:sitename/:shift", getSewDayRepSchd);
router.get(
  "/sewing-day-ouput-size/:schDate/:sitename/:shift",
  getSewDayRepSize
);
router.get("/sewing-day-ouput-bypo/:schDate/:sitename/:shift", getSewDayRepPO);
router.get(
  "/sewing-day-ouput-size-bypo/:schDate/:sitename/:shift",
  getSewDayRepSizePo
);

export default router;
