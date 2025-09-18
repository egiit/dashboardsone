import express from "express";
import {createLamp, deleteLamp, getAllLamps, getLampByMac, updateLamp} from "../../controllers/machine/listLamp.js";


const router = express.Router();

router.post("/", createLamp);
router.get("/", getAllLamps);
router.get("/:mac", getLampByMac);
router.put("/:mac", updateLamp);
router.delete("/:mac", deleteLamp);

export default router;