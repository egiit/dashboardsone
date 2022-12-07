import express from "express";
import { getHolidaysByYear } from "../../controllers/setup/Holidays.js";
// import { verifyToken } from '../midleware/VerifyToken.js';
const router = express.Router();

router.get("/:startYear/:endYear", getHolidaysByYear);

export default router;
