import express from "express";
import {
  createUserQC,
  deleteUserQC,
  getListQcType,
  getListUserQc,
  updateUserQc,
} from "../../controllers/production/quality/QcSetup.js";
import {
  getListDefect,
  getListPart,
  SetActualMp,
} from "../../controllers/production/quality/QualityEndlineScan.js";
const router = express.Router();

// QC Route

router.get("/list-type", getListQcType);
router.get("/users", getListUserQc);
router.get("/part", getListPart);
router.get("/defect", getListDefect);

router.post("/users", createUserQC);
router.patch("/users", updateUserQc);
router.patch("/delete/users/:id", deleteUserQC);

router.post("/endline/act-manpower", SetActualMp);

export default router;
