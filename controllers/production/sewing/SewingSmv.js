import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QuerySmvHeader,
  SewingSmvHeader,
} from "../../../models/sewingmod/sewingSmv.mod.js";

// CONTROLLER CREATE NEW SEWING SMV HEADER
export const postSewingSmvHeader = async (req, res) => {
  try {
    // let existData = [];
    const dataSmv = req.body;

    if (!dataSmv.length) {
      return res.status(404).json({
        success: false,
        message: "no data upload!",
        data: dataSmv,
      });
    }

    dataSmv.forEach(async (smvData, i) => {
      const checkSmvHeader = await SewingSmvHeader.findOne({
        where: {
          ORDER_NO: smvData.ORDER_NO,
        },
      });

      if (checkSmvHeader) {
        delete smvData.SMV_ADD_ID;
        await SewingSmvHeader.update(smvData, {
          where: {
            ORDER_NO: smvData.ORDER_NO,
          },
        });
      } else {
        delete smvData.SMV_MOD_ID;
        await SewingSmvHeader.create(smvData);
      }

      if (i + 1 === dataSmv.length)
        return res.status(201).json({
          success: true,
          message: "SMV Data Added Successfully",
          data: smvData,
          // duplicate: existData,
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

//Get SMV data sudah di join dengan PO Listing
export const getListSmvHeader = async (req, res) => {
  try {
    const listSmvHeader = await db.query(QuerySmvHeader, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json(listSmvHeader);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
