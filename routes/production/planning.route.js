import express from "express";
import {
  deleteSchDataDetail,
  deleteSchHeader,
  getCapacity,
  getDayliSch,
  getGroupHeaderWeekSch,
  getHeaderWeekSch,
  getOneCapacity,
  getOneGroupDayliSch,
  getOneHeaderWeekSch,
  patchSchDataDetail,
  postSchDataDetail,
  postSchDataHeader,
  updateDataHeader,
} from "../../controllers/production/planning/WeeklyPlaning.js";

const router = express.Router();
router.post("/header", postSchDataHeader);
router.patch("/header", updateDataHeader);
router.delete("/header/:id", deleteSchHeader);

router.get("/capacity/:startMonth/:endMonth", getCapacity);
router.get("/capacity/:startMonth/:endMonth/:capId", getOneCapacity);
router.get("/header/:startDate/:endDate", getHeaderWeekSch);
router.get("/one/header/:schId", getOneHeaderWeekSch);
router.get("/group-header/header/:capId", getGroupHeaderWeekSch);

router.post("/daily", postSchDataDetail);
router.patch("/daily", patchSchDataDetail);
router.delete("/daily/:schId/:schdId", deleteSchDataDetail);
router.get("/daily/:startDate/:endDate/:schId", getDayliSch);
router.get("/group/:schId", getOneGroupDayliSch);

export default router;
