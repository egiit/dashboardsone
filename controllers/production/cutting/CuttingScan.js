import { Orders } from "../../../models/production/order.mod.js";
import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";

import {
  CuttinScanSewingIn,
  QryCutScanInWithSize,
  QueryCheckQcOut,
  ScanCutting,
} from "../../../models/production/cutting.mod.js";
import moment from "moment";
import {
  QueryCheckSchdScan,
  QueryfindQrSewingIn,
} from "../../../models/planning/dailyPlan.mod.js";
import { GetQrlistAftrScan } from "../../../models/production/sewing.mod.js";

// CONTROLLER SCAN CUTTING
export const QRScanCutting = async (req, res) => {
  try {
    const barcodeserial = req.body.barcodeserial;
    const datetimenow = moment().format("YYYY-MM-DD HH:MM:SS");

    const checkBarcodeSerial = await Orders.findAll({
      attributes: ["BARCODE_SERIAL"],
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
    });

    if (checkBarcodeSerial.length == 0) {
      return res.status(400).json({
        success: true,
        message: "Barcode Serial not exist!",
        data: [],
      });
    } else {
      const checkCuttingScanTime = await ScanCutting.findAll({
        attributes: ["BARCODE_SERIAL", "CUTTING_SCANTIME"],
        where: {
          BARCODE_SERIAL: barcodeserial,
        },
      });

      if (checkCuttingScanTime[0].CUTTING_SCANTIME != null) {
        res.status(200).json({
          success: true,
          message: "order already scan on cutting!",
          data: checkCuttingScanTime,
        });
      } else {
        await ScanCutting.update(
          {
            CUTTING_SCANTIME: datetimenow,
          },
          {
            where: {
              BARCODE_SERIAL: barcodeserial,
            },
          }
        );

        res.status(200).json({
          success: true,
          data: [],
          message: "order scan cutting successfully",
        });
      }
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//CUTTING SEWING IN
export const QRScanSewingIn = async (req, res) => {
  try {
    const { barcodeserial, schDate, sitename, lineName, userId } = req.body;
    //check apakah barcode serial ada pada table orders detail
    //find schedule
    const checkBarcodeSerial = await db.query(QueryfindQrSewingIn, {
      replacements: {
        barcodeserial: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });
    // console.log(checkBarcodeSerial);
    //jika tidak ada reject
    if (checkBarcodeSerial.length === 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "error",
        message: "QRCode Not Found",
      });
    }

    //jika ada maka bandingkan dengan
    if (checkBarcodeSerial) {
      const valueBarcode = checkBarcodeSerial[0];

      const checkScan = await CuttinScanSewingIn.findAll({
        where: {
          BARCODE_SERIAL: barcodeserial,
        },
      });
      //jika ketemu sudah di scan reject
      if (checkScan.length !== 0) {
        return res.status(200).json({
          success: true,
          qrstatus: "duplicate",
          message: "Already Scan",
        });
      }

      //find schedule
      const checkSchdNsize = await db.query(QueryCheckSchdScan, {
        replacements: {
          plannDate: schDate,
          sitename: sitename,
          lineName: lineName ? lineName : valueBarcode.LINE_NAME,
          moNo: valueBarcode.MO_NO,
          styleDesc: valueBarcode.ORDER_STYLE,
          colorCode: valueBarcode.ORDER_COLOR,
          sizeCode: valueBarcode.ORDER_SIZE,
        },
        type: QueryTypes.SELECT,
      });

      // console.log(checkSchdNsize);
      // console.log({
      //   plannDate: schDate,
      //   sitename: sitename,
      //   lineName: lineName ? lineName : valueBarcode.LINE_NAME,
      //   moNo: valueBarcode.MO_NO,
      //   styleDesc: valueBarcode.ORDER_STYLE,
      //   colorCode: valueBarcode.ORDER_COLOR,
      //   sizeCode: valueBarcode.ORDER_SIZE,
      // });
      if (checkSchdNsize.length > 0) {
        const { SCHD_ID, SCH_ID } = checkSchdNsize[0];
        const dataBarcode = {
          BARCODE_SERIAL: valueBarcode.BARCODE_SERIAL,
          SCHD_ID,
          SCH_ID,
          SEWING_SCAN_BY: userId,
          SEWING_SCAN_LOCATION: sitename,
        };
        const returnData = {
          ...valueBarcode,
          LINE_NAME: lineName ? lineName : valueBarcode.LINE_NAME,
          SCHD_ID,
          SCH_ID,
          SITE_NAME: sitename,
        };
        const pushQrSewin = await CuttinScanSewingIn.create(dataBarcode);
        if (pushQrSewin)
          return res.status(200).json({
            success: true,
            qrstatus: "success",
            message: "Scan Success",
            data: returnData,
          });
      }

      return res.status(200).json({
        success: true,
        qrstatus: "error",
        message: "No Schedule",
      });
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

export const QrListAftrSewingIn = async (req, res) => {
  try {
    //line name disini tidak dipakai tapi dipakai untuk tablet
    const { schDate, sitename, linename, barcodeserial } = req.params;

    const listQrAfterScan = await db.query(GetQrlistAftrScan, {
      replacements: { schDate, sitename, linename, barcodeserial },
      type: QueryTypes.SELECT,
    });

    if (listQrAfterScan)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: listQrAfterScan,
      });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//delete qr sewing IN
export const DelQrScanSewIN = async (req, res) => {
  try {
    const { barcodeserial } = req.params;

    const checkQr = await db.query(QryCutScanInWithSize, {
      replacements: {
        qrcode: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });

    if (!checkQr)
      return res.status(202).json({
        success: false,
        message: "QR Not Found",
      });

    const checkOutput = await db.query(QueryCheckQcOut, {
      replacements: {
        sizeCode: checkQr[0].ORDER_SIZE,
        schdId: checkQr[0].SCHD_ID,
      },
      type: QueryTypes.SELECT,
    });

    if (checkOutput)
      return res.status(202).json({
        success: false,
        message: "Can't Delete QR Already Output QC Endline",
      });

    const deleteQr = await CuttinScanSewingIn.destroy({
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
    });

    if (deleteQr) {
      return res.status(200).json({
        success: true,
        message: "QR Deleted",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};
