import express from "express";
const router = express.Router();

import {
  adjustPlanByReturn,
  confrmReturn,
  deleteDataSewIn,
  DelQrScanSewIN,
  ListQrReturnFrmSewing,
  QrListAftrSewingIn,
  QRScanCutting,
  QRScanSewingIn,
} from "../../controllers/production/cutting/CuttingScan.js";
import { newQRCutting } from "../../controllers/production/cutting/CuttingGenerateQR.js";
import {
  getCuttingOrder,
  getOrderByBLK,
} from "../../controllers/production/cutting/CuttingGetOrder.js";
import { getBaseRepCutLoad } from "../../controllers/production/cutting/CuttingLoadinRep.js";
import { getCutDeptPrepWip, getCutDeptSewingWip, getCutDeptWipProccess, getDataDashCutting, getDetailCutOutput, getLoadPlanVsActual, getLowWipLoad, getMolSupSewDtl, getPlanVSactDtl, getWipMolChartClick, getWipPrepDtl } from "../../controllers/production/dashAnalitycs/DashCutting.js";
// ROUTE CUTTING

router.get("/order/list/:startDate/:endDate", getCuttingOrder);
router.get("/order/bundle/:orderNo", getOrderByBLK);
router.get(
  "/qr/scan-sewing-in/:schDate/:sitename/:linename/:barcodeserial",
  QrListAftrSewingIn
);

router.post("/order/qrgenerate", newQRCutting);
router.post("/order/scan", QRScanCutting);
router.post("/qr/scan-sewing-in", QRScanSewingIn);
router.delete("/qr/scan-sewing-in/:barcodeserial", DelQrScanSewIN);

//return qr from sewing
router.get(
  "/qr/req-return/:sitename/:startDate/:endDate/:status",
  ListQrReturnFrmSewing
);
//return qr cnfirm in preparation
router.post(
  "/qr/req-return/",
  adjustPlanByReturn,
  deleteDataSewIn,
  confrmReturn
);

//cutting loading report
router.get("/baseReport/:startDate/:endDate/:site", getBaseRepCutLoad);

//cutting dashboard
router.get("/cutting-dashboard", getDataDashCutting);
router.get("/cutting-dashboard-plan-vs-actual", getLoadPlanVsActual);
router.get("/cutting-dashboard-sewing-wip/:date", getCutDeptSewingWip);
router.get("/cutting-dashboard-prep-wip/:date", getCutDeptPrepWip);
// router.get("/cutting-dashboard-cut-wip/:date", getCutDeptWipProccess);
router.get("/cutting-dashboard-prepline-wip/:date", getLowWipLoad);

//cutting dashboard chart action
router.get("/cutting-dashboard-detail-output", getDetailCutOutput);
router.get("/cutting-dashboard-dtl-out-excuting", getMolSupSewDtl);
router.get("/cutting-dashboard-dtl-plan-vs-actual", getPlanVSactDtl);
router.get("/cutting-dashboard-dtl-prep-and-sewing", getWipPrepDtl);
router.get("/cutting-dashboard-dtl-cut-wip", getWipMolChartClick);

export default router;
