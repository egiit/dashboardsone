import express from "express";
import {
    createDownTime,
    deleteDownTime,
    getAllDownTimes,
    getDownTimeById,
    updateDownTime, updateStatusAction, updateStatusOnFix
} from "../../controllers/machine/machine.js";
const router = express.Router();

router.post("/down-time", createDownTime);
router.get("/down-time", getAllDownTimes);
router.get("/down-time/:id", getDownTimeById);
router.put("/down-time/:id", updateDownTime);
router.patch("/down-time/fix", updateStatusOnFix);
router.patch("/down-time/action", updateStatusAction);

router.delete("/down-time/:id", deleteDownTime);

export default router