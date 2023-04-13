import express from "express";
const router = express.Router();
import {
  CheckChartNo,
  checkDetailSizeOut,
  checkPomBfrUpdate,
  CreatMesChart,
  deleteMeasChart,
  getDataBlkForMeasur,
  getDataChartDtl,
  getListBuyer,
  getListStyleByBuyer,
  getMeasurChart,
  getMeasurChartByPO,
  postChartToOrder,
  removeChartInOrder,
  updateChart,
} from "../../controllers/production/quality/QcMeasurement.js";
import {
  deleteDataMeasOut,
  getMeasureOutput,
  getMeasureSpec,
  postDataMeasOut,
} from "../../controllers/production/quality/QEndMeasurement.js";

router.get("/buyerlist", getListBuyer);
router.get("/stylelist", getListStyleByBuyer);
router.get("/getchart/:buyer/:style", getMeasurChart);
router.get("/orderlist/:startMonth/:endMonth", getDataBlkForMeasur);
router.get("/check-chart-no/:MES_CHART_NO", CheckChartNo);
router.get("/chart-detail/:chartNo", getDataChartDtl);

router.get("/chart-by-order/:orderNo", getMeasurChartByPO);

router.post("/chart-new", CreatMesChart);
router.patch("/chart-new", checkDetailSizeOut, checkPomBfrUpdate, updateChart);
router.post("/chart-to-order", postChartToOrder);

router.delete("/chart-delete/:chartNo", deleteMeasChart);
router.delete("/chart-to-order/:MES_CHART_NO/:ORDER_NO", removeChartInOrder);

//qc end measurement qc endline
router.get("/spec-list/:orderNo/:sizeCode", getMeasureSpec);
router.get(
  "/endline-out/:barcodeSerial/:siteName/:lineName/:sizeCode",
  getMeasureOutput
);

router.delete("/endline-out/:barcodeSerial/:sequance", deleteDataMeasOut);

router.post("/endline/", postDataMeasOut);
export default router;
