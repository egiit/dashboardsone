import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  ManpowewrDailyDetail,
  RemarkDailyDetail,
  WorkingHoursDetail,
} from "../../../models/production/sewing.mod.js";

//POST working  hours detail
export const postDailyWh = async (req, res) => {
  try {
    const data = req.body;
    const findWh = await WorkingHoursDetail.findOne({
      where: {
        SCHD_ID: data.SCHD_ID,
        SHIFT: data.SHIFT,
      },
    });

    if (!findWh) {
      const newWh = await WorkingHoursDetail.create(data);

      return res
        .status(200)
        .json({ message: "Success Set Working Hours", data: newWh });
    } else {
      await WorkingHoursDetail.update(data, {
        where: {
          SCHD_ID: data.SCHD_ID,
          SHIFT: data.SHIFT,
        },
      });
    }

    return res.status(200).json({ message: "Success Set Working Hours" });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//sewing manpower and Working Hour
export const postWhMpOt = async (req, res) => {
  try {
    //get data from front end
    const dataPlan = req.body;

    //chceck existing data form mp_daily_detail
    const checkMpOt = await ManpowewrDailyDetail.findOne({
      where: {
        SCHD_ID: dataPlan.SCHD_ID,
        SHIFT: dataPlan.SHIFT,
      },
    });

    //chceck existing data form workingHours_detail
    const checkWhOt = await WorkingHoursDetail.findOne({
      where: {
        SCHD_ID: dataPlan.SCHD_ID,
        SHIFT: dataPlan.SHIFT,
      },
    });

    //if data Manpower exist and data before with data new same update
    // if (checkMpOt && checkMpOt.dataValues.PLAN_MP_OT !== dataPlan.PLAN_MP_OT) {
    //   const dataForPostMp = { ...dataPlan, CREATE_BY: null };
    //   await ManpowewrDailyDetail.update(dataForPostMp, {
    //     where: { ID_MPD: checkMpOt.dataValues.ID_MPD },
    //   });
    // }
    if (checkMpOt) {
      const dataForPostMp = { ...dataPlan, CREATE_BY: null };
      await ManpowewrDailyDetail.update(dataForPostMp, {
        where: { ID_MPD: checkMpOt.dataValues.ID_MPD },
      });
    } else {
      const dataForPostMp = { ...dataPlan, UPDATE_BY: null };
      await ManpowewrDailyDetail.create(dataForPostMp);
    }

    //if data Workinghours exist and data before with data new same update
    // if (checkWhOt && checkWhOt.dataValues.PLAN_WH_OT !== dataPlan.PLAN_WH_OT) {
    //   const dataForPostwH = { ...dataPlan, CREATE_BY: null };
    //   await WorkingHoursDetail.update(dataForPostwH, {
    //     where: { ID_WHD: checkWhOt.dataValues.ID_WHD },
    //   });
    // }
    if (checkWhOt) {
      const dataForPostwH = { ...dataPlan, CREATE_BY: null };
      await WorkingHoursDetail.update(dataForPostwH, {
        where: { ID_WHD: checkWhOt.dataValues.ID_WHD },
      });
    } else {
      const dataForPostwH = { ...dataPlan, UPDATE_BY: null };
      await WorkingHoursDetail.create(dataForPostwH);
    }

    res.status(200).json({
      message: "success add Mp or WH ot",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//POST Remark  hours detail
export const postRemark = async (req, res) => {
  try {
    const data = req.body;

    const findRemark = await RemarkDailyDetail.findOne({
      where: {
        SCHD_ID: data.SCHD_ID,
        SHIFT: data.SHIFT,
      },
    });

    if (!findRemark) {
      const newRemark = await RemarkDailyDetail.create(data);
      return res
        .status(200)
        .json({ message: "Success Set Remark", data: newRemark });
    }

    const updateNwRemak = await RemarkDailyDetail.update(data, {
      where: {
        SCHD_ID: data.SCHD_ID,
        SHIFT: data.SHIFT,
      },
    });
    return res
      .status(200)
      .json({ message: "Success Update Remark", data: updateNwRemak });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
