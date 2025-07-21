import express from "express";
import {
  getDailyDefDetail,
  getDailyDefDetailSum,
  getMeasurementRep,
  getPlanningEendReport,
  getQcEndChckTablet,
  getQcEndCheckPerHour,
  getQcEndDefReprTblt,
  getQcEndSumPartDefCode,
} from "../../controllers/production/quality/QcEndlineRep.js";
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
  getPlanSizePendding,
  getQrListPendding,
  GetQrSewingIn,
  handleUndo,
  planSizePost,
  planSizeUpdate,
  postEndlineOutput,
  postReturnBdl,
  postUpdtEndlineRmks,
  repairedProccess,
  SetActualMp,
  sewingScanOut,
} from "../../controllers/production/quality/QualityEndlineScan.js";
const router = express.Router();

// QC Route

router.get("/list-type", getListQcType);
router.get("/users", getListUserQc);
router.get("/part", getListPart);
router.get("/defect", getListDefect);

// router.post("/users", createUserQC);
// router.patch("/users", updateUserQc);
// router.patch("/delete/users/:id", deleteUserQC);

// router.post("/endline/act-manpower", SetActualMp);

//planning size endline
router.get(
  "/endline/plan-by-size/:schDate/:sitename/:linename/:userId",
  getPlanningEendBySize
);

//get storage qr after scan sewing in
router.get(
  "/endline/qr-sewing-in/:schDate/:sitename/:linename/:barcodeserial",
  GetQrSewingIn
);
//get storage qr pendding
router.get(
  "/endline/qr-sewing-in-pend/:schDate/:sitename/:linename",
  getQrListPendding
);

//qc endline inspection resullt main button
router.get("/endline/planz/:schdid/:size", getDataQcEndSizeResult);
//get plansize pendding
router.get(
  "/endline/planz-pendding/:schDate/:sitename/:linename/:userId",
  getPlanSizePendding
);
router.get("/endline/defect/:schdid/:size", getDefForRepair);

//post qc endline tablet
// router.post("/endline/output", postEndlineOutput);
// router.post("/endline/plansize", planSizePost);
// router.patch("/endline/plansize", planSizeUpdate);
// router.patch("/endline/repaired", repairedProccess);
// router.post("/endline/qr/transfer", sewingScanOut);
// router.post("/endline/plan/remarks", postUpdtEndlineRmks);
// router.post("/endline/qr/return", postReturnBdl);

//undo
router.patch("/endline/undo", handleUndo);

//qc endlineReport
router.get(
  "/report/endline-planing/:schDate/:sitename/:shift",
  getPlanningEendReport
);
router.get(
  "/report/check-per-hour/:schDate/:idSiteLine/:schdId",
  getQcEndCheckPerHour
);
router.get(
  "/report/sum-part-def/:schDate/:idSiteLine/:schdId",
  getQcEndSumPartDefCode
);
router.get(
  "/report/sum-per-hour-tablet/:schDate/:idSiteLine",
  getQcEndChckTablet
);
router.get(
  "/report/sum-part-def-tablet/:schDate/:idSiteLine",
  getQcEndDefReprTblt
);
router.get(
  "/report/detail-defect/:schDate/:sitename/:shift",
  getDailyDefDetail
);
router.get(
  "/report/detail-defect-sum/:schDate/:sitename/:shift",
  getDailyDefDetailSum
);

//measurement report
router.get("/report/measurement/:orderNo/:schdId/:shift", getMeasurementRep);

export default router;
