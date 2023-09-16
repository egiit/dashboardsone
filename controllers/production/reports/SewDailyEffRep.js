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
    const { schDate, sitename } = req.params;
    // const { schDate, sitename, shift } = req.params;

    // const today = moment().format("YYYY-MM-DD");

    // let queryEff = today === schDate ? QueryEffCurDate : QueryEffFromLog;

    const detailSch = await db.query(QueryEffFromLog, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        // shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    //jika ada result
    if (detailSch.length > 0) {
      //buat uniq line berdasrkan data eff
      const uniqueListLineExist = [
        ...new Map(
          detailSch.map((item) => [item["ID_SITELINE"], item])
        ).values(),
      ];
      const listLineExist = uniqueListLineExist.map(
        ({ SITE_NAME, SHIFT, ID_SITELINE, LINE_NAME }) => ({
          SITE_NAME,
          SHIFT,
          ID_SITELINE,
          LINE_NAME,
          LINE_SHIFT: `${LINE_NAME} - ${SHIFT}`,
        })
      );
      return res.status(200).json({
        success: true,
        data: detailSch,
        lineList: listLineExist,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: [],
        lineList: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing daily eff",
      data: error,
    });
  }
};
