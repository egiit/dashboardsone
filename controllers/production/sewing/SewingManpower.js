import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  GetMpPlanVsActual,
  SiteLine,
} from "../../../models/production/sewing.mod.js";

//Get ListLine by Modale
export const getListLineByModel = async (req, res) => {
  try {
    const listLine = await SiteLine.findAll({});

    return res.status(200).json(listLine);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//update manpower default
export const updateManpowerDefault = async (req, res) => {
  try {
    const dataLine = req.body;
    await SiteLine.update(dataLine, {
      where: {
        ID_SITELINE: dataLine.ID_SITELINE,
      },
    });

    return res.status(200).json({ message: "Success Update Default Manpower" });
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//query get plan vs actual Manpower
export const getManpowerPlanVsActual = async (req, res) => {
  try {
    const { date, site, shift } = req.params;
    const listOfMp = await db.query(GetMpPlanVsActual, {
      replacements: {
        date: date,
        site: site,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(listOfMp);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
