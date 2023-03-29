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
  updateChart,
} from "../../controllers/production/quality/QcMeasurement.js";

router.get("/buyerlist", getListBuyer);
router.get("/stylelist", getListStyleByBuyer);
router.get("/getchart/:buyer/:style", getMeasurChart);
router.get("/orderlist/:startMonth/:endMonth", getDataBlkForMeasur);
router.get("/check-chart-no/:MES_CHART_NO", CheckChartNo);
router.get("/chart-detail/:chartNo", getDataChartDtl);

router.get("/chart-by-order/:orderNo", getMeasurChartByPO);

router.post("/chart-new", CreatMesChart);
router.patch("/chart-new", checkDetailSizeOut, checkPomBfrUpdate, updateChart);
router.delete("/chart-delete/:chartNo", deleteMeasChart);

export default router;
