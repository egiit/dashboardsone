import { Orders } from "../../../models/production/order.mod.js";
// import { ScanQuality } from "../../../models/setup/production/quality.mod";
import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";

// import moment from "moment";
import { ManpowewrDailyDetail } from "../../../models/production/sewing.mod.js";
import {
  QueryGetListDefect,
  QueryGetListPart,
} from "../../../models/production/quality.mod.js";

// Update Actual Manpower Normal / OT
export const SetActualMp = async (req, res) => {
  try {
    const dataPlan = req.body;
    //check manpower on mp_daily_detail
    const findMp = await ManpowewrDailyDetail.findOne({
      where: {
        SCHD_ID: dataPlan.SCHD_ID,
      },
    });
    // if founded
    if (findMp) {
      const updateMp = await ManpowewrDailyDetail.update(dataPlan, {
        where: {
          SCHD_ID: dataPlan.SCHD_ID,
        },
      });
      return res.status(200).json({
        success: true,
        data: updateMp,
        message: "Update Actual Manpower Successfully",
      });
    }
    const create = await ManpowewrDailyDetail.create(dataPlan);
    return res.status(200).json({
      success: true,
      data: create,
      message: "Create Actual Manpower Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//getlist Part
export const getListPart = async (req, res) => {
  try {
    const getListPart = await db.query(QueryGetListPart, {
      type: QueryTypes.SELECT,
    });

    return res.json(getListPart);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
//getlist Part
export const getListDefect = async (req, res) => {
  try {
    const listDefect = await db.query(QueryGetListDefect, {
      type: QueryTypes.SELECT,
    });

    return res.json(listDefect);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
