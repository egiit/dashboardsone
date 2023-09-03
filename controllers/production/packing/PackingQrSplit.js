import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  PackingQrSplit,
  getQrByMain,
} from "../../../models/production/packing.mod.js";
import { ScanSewingQrSplit } from "../../../models/production/sewing.mod.js";

//resulst packscan in
export const getPackingQrSplitList = async (req, res) => {
  try {
    //line line name dan barcode serialhanya  pemaniss
    const { startDate, endDate, site } = req.params;

    const qrSplitList = await db.query(PackingQrSplit, {
      replacements: {
        startDate,
        endDate,
        site,
      },
      type: QueryTypes.SELECT,
    });

    if (qrSplitList) {
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: qrSplitList,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "QR Tidak Ditemukan",
        data: qrSplitList,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "Error saat pengambilan data hubungi Administrator",
    });
  }
};

// CONTROLLER GENERATE QR split
export const qrSplitGenerate = async (req, res) => {
  try {
    const dataQr = req.body;

    if (!dataQr.length) {
      return res.status(404).json({
        success: false,
        message: "no QR For Split!",
        data: dataQr,
      });
    }

    dataQr.forEach(async (order, i) => {
      const checkGeneratedQR = await ScanSewingQrSplit.findOne({
        where: {
          BARCODE_SERIAL: order.BARCODE_SERIAL,
        },
      });

      if (checkGeneratedQR) {
        await ScanSewingQrSplit.update(
          {
            PRINT_STATUS: 1,
            PRINT_BY: order.USER_ID,
          },
          {
            where: {
              BARCODE_SERIAL: order.BARCODE_SERIAL,
            },
          }
        );
      }

      if (i + 1 === dataQr.length)
        return res.status(201).json({
          success: true,
          message: "QR Split Successfully",
        });
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

//generate SplitByScan
export const generateSplitByScan = async (req, res) => {
  try {
    //line line name dan barcode serialhanya  pemaniss
    const { BARCODE_MAIN, USER_ID } = req.body;

    const qrSplitList = await ScanSewingQrSplit.findAll({
      where: {
        BARCODE_MAIN: BARCODE_MAIN,
      },
    });

    if (qrSplitList.length === 0) {
      return res.status(200).json({
        success: false,
        message: "QR Tidak Ditemukan",
        data: qrSplitList,
      });
    } else {
      await ScanSewingQrSplit.update(
        {
          PRINT_STATUS: 1,
          PRINT_BY: USER_ID,
        },
        {
          where: {
            BARCODE_MAIN: BARCODE_MAIN,
          },
        }
      );

      const qrFound = await db.query(getQrByMain, {
        replacements: {
          qrCode: BARCODE_MAIN,
        },
        type: QueryTypes.SELECT,
      });

      return res.status(200).json({
        success: true,
        message: "QR Ditemukan",
        data: qrFound,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "Error saat proses print qr",
    });
  }
};
