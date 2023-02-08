import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import moment from "moment";

import {
  FindTransferData,
  ScanPackingIn,
} from "../../../models/production/packing.mod.js";

// CONTROLLER SCAN PACKING
export const ScanPackingQrIn = async (req, res) => {
  try {
    const { BARCODE_SERIAL } = req.body;

    //check barcode serial sudah transfer atau belum
    const checkBarcodeSerial = await db.query(FindTransferData, {
      replacements: {
        barcodeserial: BARCODE_SERIAL,
      },
      type: QueryTypes.SELECT,
    });

    if (checkBarcodeSerial.length === 0) {
      return res.status(200).json({
        qrstatus: "error",
        message: "QR Serial Not Found!",
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

    const addQr = await ScanPackingIn.create(req.body);

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
    res.status(404).json({
      success: false,
      qrstatus: "error",
      message: "error processing request",
    });
  }
};

//FOR FIND TRANSFER QR
