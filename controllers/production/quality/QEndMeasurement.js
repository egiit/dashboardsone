import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  MeasOutput,
  QryGetDataMeasOut,
  QryGetSpecQCend,
  QryMeasCheck,
} from "../../../models/production/measurement.mod.js";

//get data For Measurement Inspect Qc End
export const getMeasureSpec = async (req, res) => {
  try {
    const { orderNo, sizeCode } = req.params;
    const specSizeMeas = await db.query(QryGetSpecQCend, {
      replacements: { orderNo, sizeCode },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: specSizeMeas,
    });
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get data BLK for measurement",
      data: error,
    });
  }
};
//get data For Measurement output
export const getMeasureOutput = async (req, res) => {
  try {
    const { barcodeSerial, siteName, lineName, sizeCode } = req.params;
    const measureOut = await db.query(QryGetDataMeasOut, {
      replacements: { barcodeSerial, siteName, lineName, sizeCode },
      type: QueryTypes.SELECT,
    });

    return res.json({
      success: true,
      data: measureOut,
    });
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get data output measurement",
      data: error,
    });
  }
};

export const postDataMeasOut = async (req, res) => {
  try {
    const datas = req.body;
    if (datas.length === 0)
      return res.status(404).json({ message: "No Data Measurement to Post" });
    // console.log(datas);

    const { BARCODE_SERIAL, MES_SEQ } = datas[0];
    await MeasOutput.destroy({
      where: {
        BARCODE_SERIAL: BARCODE_SERIAL,
        MES_SEQ: MES_SEQ,
      },
    });

    //looping data from Front End
    await MeasOutput.bulkCreate(datas).then(() => {
      return res.status(200).json({ message: "Success Post Measurement" });
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data BLK for measurement",
      data: error,
    });
  }
};

export const deleteDataMeasOut = async (req, res) => {
  try {
    const { barcodeSerial, sequance } = req.params;

    const deleteMeasOut = await MeasOutput.destroy({
      where: {
        BARCODE_SERIAL: barcodeSerial,
        MES_SEQ: sequance,
      },
    });

    if (deleteMeasOut)
      return res.json({
        message: `Success delete measurement ${sequance}`,
      });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data for measurement",
      data: error,
    });
  }
};

export const getMeasCountCheck = async (req, res) => {
  try {
    const { schDate, sitename, linename } = req.params;
    const measCheck = await db.query(QryMeasCheck, {
      type: QueryTypes.SELECT,
      replacements: { schDate, sitename, linename },
    });

    return res.status(200).json({
      success: true,
      data: measCheck,
    });
  } catch (error) {
    res.status(404).json({
      message: "error processing request Qr Meas Check",
      data: error,
    });
  }
};
