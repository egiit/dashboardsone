import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  SewingListLine,
  SewingListSite,
} from "../../../models/production/sewing.mod.js";

export const getSiteList = async (req, res) => {
  try {
    const siteList = await db.query(SewingListSite, {
      type: QueryTypes.SELECT,
    });

    return res.json(siteList);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getListLine = async (req, res) => {
  try {
    const listLIne = await db.query(SewingListLine, {
      type: QueryTypes.SELECT,
    });

    return res.json(listLIne);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
