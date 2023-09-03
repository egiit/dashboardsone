import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import moment from "moment";

import {
  FindTransferData,
  QueryResPackScanIn,
  ScanPackingIn,
  TemporaryQrPackIn,
} from "../../../models/production/packing.mod.js";
import { QueryDailyPlanPackIn } from "../../../models/planning/dailyPlan.mod.js";
import { ScanSewingQrSplit } from "../../../models/production/sewing.mod.js";

// CONTROLLER SCAN PACKING
export const ScanPackingQrIn = async (req, res) => {
  try {
    const { BARCODE_SERIAL } = req.body;

    //check split
    const checkSplit = await ScanSewingQrSplit.findOne({
      where: {
        BARCODE_MAIN: BARCODE_SERIAL,
      },
    });

    if (checkSplit) {
      return res.status(200).json({
        qrstatus: "error",
        message: "QR Sudah displit",
      });
    }

    //check barcode serial sudah transfer atau belum
    const checkBarcodeSerial = await db.query(FindTransferData, {
      replacements: {
        barcodeserial: BARCODE_SERIAL,
      },
      type: QueryTypes.SELECT,
    });

    if (checkBarcodeSerial.length === 0) {
      // const checkSewingIn = await db.query(TemporaryQrPackIn, {
      //   replacements: {
      //     barcodeserial: BARCODE_SERIAL,
      //   },
      //   type: QueryTypes.SELECT,
      // });

      // if (checkSewingIn.length === 0) {
      //   return res.status(200).json({
      //     qrstatus: "error",
      //     message: "QR Serial Not Found!",
      //   });
      // }
      return res.status(200).json({
        qrstatus: "error",
        printed: false,
        message: "QR Not Yet Transfer",
        // data: checkSewingIn[0],
      });
    }

    //check barcode serial sudah in atau belum
    const checkDuplicate = await ScanPackingIn.findOne({
      ttributes: ["BARCODE_SERIAL"],
      where: {
        BARCODE_SERIAL: BARCODE_SERIAL,
      },
    });

    if (checkDuplicate) {
      return res.status(200).json({
        qrstatus: "duplicate",
        message: "Duplicate",
      });
    }

    const barcodePacking = { ...checkBarcodeSerial[0], ...req.body };
    const addQr = await ScanPackingIn.create(barcodePacking);

    if (!addQr)
      return res.status(400).json({
        qrstatus: "error",
        message: "error",
      });

    const valueBarcode = checkBarcodeSerial[0];

    res.status(200).json({
      qrstatus: "success",
      data: { ...valueBarcode, SCAN_TIME: moment().format("HH:mm") },
      message: "OK",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      qrstatus: "error",
      message: "error processing request",
    });
  }
};

//resulst packscan in
export const QrListAftrPackingIn = async (req, res) => {
  try {
    //line line name dan barcode serialhanya  pemaniss
    const { scanDate, linename, barcodeserial } = req.params;

    const listQrAfterScan = await db.query(QueryResPackScanIn, {
      replacements: { scanDate, linename, barcodeserial },
      type: QueryTypes.SELECT,
    });

    if (listQrAfterScan)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: listQrAfterScan,
      });
  } catch (error) {
    // console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

export const getDailyPlanPackIn = async (req, res) => {
  try {
    const { schDate } = req.params;

    const listPlanning = await db.query(QueryDailyPlanPackIn, {
      replacements: { schDate },
      type: QueryTypes.SELECT,
    });

    if (listPlanning)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: listPlanning,
      });
  } catch (error) {
    // console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};
