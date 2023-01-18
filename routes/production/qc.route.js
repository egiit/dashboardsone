import express from "express";
import {
  createUserQC,
  deleteUserQC,
  getListQcType,
  getListUserQc,
  updateUserQc,
} from "../../controllers/production/quality/QcSetup.js";
const router = express.Router();

// QC Route

router.get("/list-type", getListQcType);
router.get("/users", getListUserQc);

router.post("/users", createUserQC);
router.patch("/users", updateUserQc);
router.patch("/delete/users/:id", deleteUserQC);

export default router;
