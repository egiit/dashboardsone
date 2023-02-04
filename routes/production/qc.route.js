import express from "express";
import {
  createUserQC,
  deleteUserQC,
  getListQcType,
  getListUserQc,
  updateUserQc,
} from "../../controllers/production/quality/QcSetup.js";
import {
  getDataQcEndSizeResult,
  getDefForRepair,
  getListDefect,
  getListPart,
  getPlanningEendBySize,
  GetQrSewingIn,
  handleUndo,
  planSizePost,
  postEndlineOutput,
  repairedProccess,
  SetActualMp,
  sewingScanOut,
} from "../../controllers/production/quality/QualityEndlineScan.js";
import { QueryEndlinePlanSize } from "../../models/production/quality.mod.js";
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

//planning size endline
router.get(
  "/endline/plan-by-size/:schDate/:sitename/:linename/",
  getPlanningEendBySize
);

//get list qr after scan sewing in
router.get(
  "/endline/qr-sewing-in/:schDate/:sitename/:linename/:barcodeserial",
  GetQrSewingIn
);

//qc endline qr output qty
router.get("/endline/planz/:schdid/:size", getDataQcEndSizeResult);
router.get("/endline/defect/:schdid/:size", getDefForRepair);

//post qc endline tablet
router.post("/endline/output", postEndlineOutput);
router.post("/endline/plansize", planSizePost);
router.patch("/endline/repaired", repairedProccess);
router.post("/endline/qr/transfer", sewingScanOut);

//undo
router.patch("/endline/undo", handleUndo);
export default router;
