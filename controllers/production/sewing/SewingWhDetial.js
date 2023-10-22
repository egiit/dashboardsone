import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  ManpowewrDailyDetail,
  RemarkDailyDetail,
  WorkingHoursDetail,
  qryGetMpPlan,
  qryGetSmvPlan,
  qryGetWhPlan,
} from "../../../models/production/sewing.mod.js";
import { SmvDailyPlan } from "../../../models/planning/dailyPlan.mod.js";

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
          ID_WHD: findWh.ID_WHD,
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
    if (!checkWhOt) {
      const dataForPostwH = { ...dataPlan, UPDATE_BY: null };
      await WorkingHoursDetail.create(dataForPostwH);
    } else {
      const dataForPostwH = { ...dataPlan, CREATE_BY: null };
      await WorkingHoursDetail.update(dataForPostwH, {
        where: { ID_WHD: checkWhOt.dataValues.ID_WHD },
      });
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

export const clearFixDouble = async (req, res) => {
  try {
    const { schdId, shift } = req.body;
    res;

    const mpPlanList = await db.query(qryGetMpPlan, {
      replacements: { schdId, shift },
      type: QueryTypes.SELECT,
    });

    const whList = await db.query(qryGetWhPlan, {
      replacements: { schdId, shift },
      type: QueryTypes.SELECT,
    });

    const smvList = await db.query(qryGetSmvPlan, {
      replacements: { schdId, shift },
      type: QueryTypes.SELECT,
    });

    if (mpPlanList.length < 2 && whList.length < 2 && smvList.length < 2) {
      return res.json({ message: "Tidak Ada Data Duplicate" });
    }

    const proccDelMp = await delMP(mpPlanList);
    const proccDelWh = await delWh(whList);
    const proccDelSmv = await delSmv(smvList);
    // console.log({ proccDelMp, proccDelWh, proccDelSmv });

    if (!proccDelMp || !proccDelWh || !proccDelSmv) {
      return res.json({
        success: false,
        message: "error processing clear data",
      });
    } else {
      return res.json({
        success: true,
        message: "Success processing clear data",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

async function delMP(data) {
  try {
    if (data.length > 1) {
      for (const [i, schd] of data.entries()) {
        if (i > 0) {
          await ManpowewrDailyDetail.destroy({
            where: {
              ID_MPD: schd.ID_MPD,
              SCHD_ID: schd.SCHD_ID,
              SHIFT: schd.SHIFT,
            },
          });
        }
        if (data.length === i + 1) return true;
      }
    } else {
      return "nodata";
    }
  } catch (error) {
    return false;
  }
}

async function delWh(data) {
  try {
    if (data.length > 1) {
      for (const [i, schd] of data.entries()) {
        if (i > 0) {
          await WorkingHoursDetail.destroy({
            where: {
              ID_WHD: schd.ID_WHD,
              SCHD_ID: schd.SCHD_ID,
              SHIFT: schd.SHIFT,
            },
          });
        }

        if (data.length === i + 1) return true;
      }
    } else {
      return "nodata";
    }
  } catch (error) {
    return false;
  }
}

async function delSmv(data) {
  try {
    if (data.length > 1) {
      for (const [i, schd] of data.entries()) {
        if (i > 0) {
          await SmvDailyPlan.destroy({
            where: {
              SMV_DAY_ID: schd.SMV_DAY_ID,
              SCHD_ID: schd.SCHD_ID,
              SHIFT: schd.SHIFT,
            },
          });
        }
        if (data.length === i + 1) return true;
      }
    } else {
      return "nodata";
    }
  } catch (error) {
    return false;
  }
}
