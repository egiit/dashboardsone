import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  GetMpPlanVsActual,
  ManPoerDetail,
  SiteLine,
} from "../../../models/production/sewing.mod.js";
import moment from "moment";
import { WorkingHours } from "../../../models/setup/workingHrs.js";

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

//Regenerate Daily manpower plan with default manpower
export const postRegenerateMp = async (req, res) => {
  try {
    //destrucure req body terdapat dua array
    const { planDate, mpdefault, dailyMpDetail } = req.body;
    //cek length kedua array
    if (mpdefault.length && dailyMpDetail.length) {
      //cari nama hari dari tanggal planing
      const getDate = moment(planDate).format("dddd");
      //cari working hour dari database
      const findWh = await WorkingHours.findOne({
        where: { WH_DAYNAME: getDate },
      });
      const getWh = findWh.dataValues;

      if (!getWh)
        return res.status(404).json({
          message: "Working Hours Not Found, Please Check Working Hours Setup",
        });

      //jika oke looping daily man power planing
      dailyMpDetail.forEach(async (detail, i) => {
        const findMpDefault = mpdefault.filter(
          (defMp) => defMp.ID_SITELINE === detail.ID_SITELINE
        )[0];

        if (findMpDefault) {
          const newPlanMp = {
            ...detail,
            MP_DATE: planDate,
            PLAN_WH: getWh.WH_VALUE,
            PLAN_MP: findMpDefault.DEFAULT_MANPOWER,
          };
          if (newPlanMp.ID_MPD !== null) {
            await ManPoerDetail.update(newPlanMp, {
              where: { ID_MPD: newPlanMp.ID_MPD },
            });
          } else {
            await ManPoerDetail.create(newPlanMp);
          }

          if (i + 1 === dailyMpDetail.length) {
            return res.status(200).json({
              message: "Success Generate Plan Man Power and Working Hours",
            });
          }
        }
      });
    }

    // //jika tidak ada data defaul mp dan tidak ada listline
    // return res
    //   .status(404)
    //   .json({ message: "No Data Default Or Data List Line" });
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
