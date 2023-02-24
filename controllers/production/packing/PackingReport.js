import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import moment from "moment";
import { QueryPackInDaily } from "../../../models/production/packing.mod.js";

//resulst packscan in
export const PackInScanInDayRep = async (req, res) => {
  try {
    //line line name dan barcode serialhanya  pemaniss
    const { scanDate, linename } = req.params;

    const dailyRepotScanIn = await db.query(QueryPackInDaily, {
      replacements: {
        startdate: scanDate,
        enddate: scanDate,
        linename: linename,
      },
      type: QueryTypes.SELECT,
    });

    if (dailyRepotScanIn)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: dailyRepotScanIn,
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
