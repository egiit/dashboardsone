import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { WorkingHoursDetail } from "../../../models/production/sewing.mod.js";

//POST working  hours detail
export const postDailyWh = async (req, res) => {
  try {
    const data = req.body;

    const findWh = await WorkingHoursDetail.findOne({
      where: {
        SCHD_ID: data.SCHD_ID,
      },
    });

    if (!findWh) {
      const newWh = await WorkingHoursDetail.create(data);
      return res
        .status(200)
        .json({ message: "Success Set Working Hours", data: newWh });
    }

    const newwh = await WorkingHoursDetail.update(data, {
      where: {
        SCHD_ID: data.SCHD_ID,
      },
    });
    return res
      .status(200)
      .json({ message: "Success Set Working Hours", data: newwh });
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
