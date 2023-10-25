import express from "express";
import {
  getArrHolidayByDate,
  getHolidaysByYear,
} from "../../controllers/setup/Holidays.js";
// import { verifyToken } from '../midleware/VerifyToken.js';
const router = express.Router();

router.get("/:startYear/:endYear", getHolidaysByYear);
router.get("/arrayholiday/:startDate/:endDate", getArrHolidayByDate);

export default router;
