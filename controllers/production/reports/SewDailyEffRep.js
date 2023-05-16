import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QueryEffCurDate,
  QueryEffFromLog,
} from "../../../models/reports/sewDayliEffRep.mod.js";
import moment from "moment";

//query get dailly eff report
export const getSewRepEff = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;

    const today = moment().format("YYYY-MM-DD");

    let queryEff = today === schDate ? QueryEffCurDate : QueryEffFromLog;

    const detailSch = await db.query(queryEff, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: detailSch,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing daily eff",
      data: error,
    });
  }
};
