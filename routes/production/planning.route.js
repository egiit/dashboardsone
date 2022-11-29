import express from "express";
import {
  getCapacity,
  getDayliSch,
  getHeaderWeekSch,
} from "../../controllers/production/planning/WeeklyPlaning.js";

const router = express.Router();

router.get("/capacity/:startMonth/:endMonth/:startDate/:endDate", getCapacity);
router.get("/header/:startDate/:endDate", getHeaderWeekSch);

router.get("/daily/:startDate/:endDate", getDayliSch);

export default router;
