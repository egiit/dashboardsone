import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QueryCapacity,
  QueryGetDayliSch,
  QueryGetHeadWeekSch,
  QueryGetHeadWeekSchOne,
  QueryGetOneDayliSch,
  WeeklyProSchd,
  WeekSchDetail,
} from "../../../models/planning/weekLyPlan.mod.js";
import moment from "moment";
import { totalCol, CheckNilai } from "../../util/Utility.js";

export const getCapacity = async (req, res) => {
  try {
    const { startMonth, endMonth } = req.params;

    if (startMonth && endMonth) {
      const capacity = await db.query(QueryCapacity, {
        replacements: {
          startMonth: startMonth,
          endMonth: endMonth,
        },
        type: QueryTypes.SELECT,
      });

      return res.json(capacity);
    }
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getHeaderWeekSch = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const weekSchHead = await db.query(QueryGetHeadWeekSch, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(weekSchHead);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getOneHeaderWeekSch = async (req, res) => {
  try {
    const { schId } = req.params;
    const weekSchHeadOne = await db.query(QueryGetHeadWeekSchOne, {
      replacements: {
        schId: schId,
      },
      type: QueryTypes.SELECT,
    });
    if (weekSchHeadOne.length > 0) {
      return res.json(weekSchHeadOne[0]);
    }

    return res.status(404).json({ message: "Sch Header Not Found" });
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//get daily or detail schedule/planing
export const getDayliSch = async (req, res) => {
  try {
    const { startDate, endDate, schId } = req.params;
    const detailSch = await db.query(QueryGetDayliSch, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        schId: schId,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(detailSch);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//get One Group SCH_ID daily or detail schedule/planing
export const getOneGroupDayliSch = async (req, res) => {
  try {
    const { schId } = req.params;
    const detailSch = await db.query(QueryGetOneDayliSch, {
      replacements: {
        schId: schId,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(detailSch);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//Post data header
export const postSchDataHeader = async (req, res) => {
  try {
    const dataWeekSch = req.body;

    const findSequence = await WeeklyProSchd.findAll({
      where: {
        SCH_CAPACITY_ID: dataWeekSch.SCH_CAPACITY_ID,
      },
    });

    if (findSequence.length > 0) {
      dataWeekSch.SCH_ORDER = findSequence.length + 1;
    } else {
      dataWeekSch.SCH_ORDER = 1;
    }

    const newSchHeader = await WeeklyProSchd.create(dataWeekSch);

    res.status(200).json({ message: "Added new schedule", data: newSchHeader });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

//Update data header
export const deleteSchHeader = async (req, res) => {
  try {
    const schId = req.params.id;
    const findSchHeader = await WeeklyProSchd.findOne({
      where: {
        SCH_ID: schId,
      },
    });

    if (!findSchHeader)
      return res.status(404).json({
        message: "Data Schedulue Tidak ditemukan",
      });

    const detailSch = await db.query(QueryGetOneDayliSch, {
      replacements: {
        schId: schId,
      },
      type: QueryTypes.SELECT,
    });

    if (detailSch.length > 0) {
      await WeekSchDetail.destroy({
        where: {
          SCH_ID: findSchHeader.SCH_ID,
        },
      });
    }

    await WeeklyProSchd.destroy({
      where: {
        SCH_ID: findSchHeader.SCH_ID,
      },
    });

    res.status(200).json({ message: "Success Delete Sch" });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error Delete request",
      data: error,
    });
  }
};

//Update data header
export const updateDataHeader = async (req, res) => {
  try {
    const dataWeekSch = req.body;

    const findSchHeader = await WeeklyProSchd.findOne({
      where: {
        SCH_CAPACITY_ID: dataWeekSch.SCH_CAPACITY_ID,
        SCH_ID_SITELINE: dataWeekSch.SCH_ID_SITELINE,
      },
    });

    if (!findSchHeader)
      return res.status(404).json({
        message: "Data Schedulue Tidak ditemukan",
      });

    const newSchHeader = await WeeklyProSchd.update(dataWeekSch, {
      where: {
        SCH_ID: findSchHeader.SCH_ID,
      },
    });

    res
      .status(200)
      .json({ message: "Success Update Sch Qty", data: newSchHeader });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error Update request",
      data: error,
    });
  }
};

//  ###################################################### SCHEDULE DETAIL ######################################################

//Post data detail
export const postSchDataDetail = async (req, res) => {
  try {
    //ambil data body
    const dataSchDetail = req.body;

    //cari group
    const records = await db.query(QueryGetOneDayliSch, {
      replacements: {
        schId: dataSchDetail.SCH_ID,
      },
      type: QueryTypes.SELECT,
    });

    //jika apakah ada group
    if (records.length > 0) {
      //check saldo header lebih dari alocation detail atau tidak
      const qtyAlocation = records.reduce(
        (sum, item) => sum + item["SCHD_QTY"],
        0
      );

      //jika update melebihi balance reject aja cuk
      if (
        qtyAlocation + parseInt(dataSchDetail.SCHD_QTY) >
        parseInt(dataSchDetail.SCHD_HEADER_QTY)
      ) {
        return res.status(201).json({
          message: `Can't Input Greater Than Balance Alocation ${
            dataSchDetail.SCHD_HEADER_QTY - qtyAlocation
          }`,
        });
      }

      //jika ada masukan databaru dengan group
      const forSorting = [...records, dataSchDetail];
      //lalu sorting untuk menemukan urutan
      const newSdetialAftrSort = forSorting.sort(
        (a, b) => new Date(a.SCHD_PROD_DATE) - new Date(b.SCHD_PROD_DATE)
      );

      //set start and finish date
      funcUpdateDate(newSdetialAftrSort, dataSchDetail.SCH_ID);

      // set number of days
      const newDnumber = newSdetialAftrSort.map((ds, i) => ({
        ...ds,
        SCHD_DAYS_NUMBER: i + 1,
        SCHD_HEAD_BALANCE: findSubValue(newSdetialAftrSort, ds, i + 1),
      }));

      // ambil data yang baru
      const newDataDtl = newDnumber.filter((data) => !data.SCHD_ID)[0];

      // post terlebih dahulu data baru
      const newSchDetailInExit = await WeekSchDetail.create(newDataDtl);

      //filter tanpa data baru lalu looping dan post untuk mendapatkan no days number baru
      newDnumber
        .filter((data) => data.SCHD_ID > 0)
        .forEach(async (newDet) => {
          await WeekSchDetail.update(newDet, {
            where: {
              SCHD_ID: newDet.SCHD_ID,
              SCH_ID: newDet.SCH_ID,
            },
          });
        });

      return res.status(200).json({
        message: "Added new schedule detail",
        data: newSchDetailInExit,
      });
    }

    //jika tidak ada group dan belum ada detail maka berikan days number baru dan post
    dataSchDetail.SCHD_DAYS_NUMBER = 1;
    dataSchDetail.SCHD_HEAD_BALANCE =
      dataSchDetail.SCHD_HEADER_QTY - dataSchDetail.SCHD_QTY;
    const updateDate = {
      SCH_START_PROD: dataSchDetail.SCHD_PROD_DATE,
      SCH_FINISH_PROD: dataSchDetail.SCHD_PROD_DATE,
    };

    await WeeklyProSchd.update(updateDate, {
      where: {
        SCH_ID: dataSchDetail.SCH_ID,
      },
    });
    const newSchDetail = await WeekSchDetail.create(dataSchDetail);

    return res
      .status(200)
      .json({ message: "Added new schedule detail", data: newSchDetail });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

//Patch Detail
export const patchSchDataDetail = async (req, res) => {
  try {
    const dataSchDetail = req.body;

    const findExist = await WeekSchDetail.findOne({
      where: {
        SCHD_ID: dataSchDetail.SCHD_ID,
        SCH_ID: dataSchDetail.SCH_ID,
      },
    });

    if (findExist) {
      //cari group
      const records = await db.query(QueryGetOneDayliSch, {
        replacements: {
          schId: dataSchDetail.SCH_ID,
        },
        type: QueryTypes.SELECT,
      });

      if (records.length > 1) {
        //check saldo header lebih dari alocation detail atau tidak
        const qtyAlocation =
          records.reduce((sum, item) => sum + item["SCHD_QTY"], 0) -
          findExist.SCHD_QTY;

        //jika update melebihi balance reject aja cuk
        if (
          qtyAlocation + parseInt(dataSchDetail.SCHD_QTY) >
          dataSchDetail.SCHD_HEADER_QTY
        ) {
          return res.status(201).json({
            message: `Can't Input Greater Than Balance Alocation ${
              dataSchDetail.SCHD_HEADER_QTY - qtyAlocation
            }`,
          });
        }

        //jika ada masukan databaru dengan group
        const forSorting = records.map((dataUpdate) =>
          dataUpdate.SCHD_ID === dataSchDetail.SCHD_ID
            ? { ...dataUpdate, SCHD_QTY: parseInt(dataSchDetail.SCHD_QTY) }
            : { ...dataUpdate }
        );
        //lalu sorting untuk menemukan urutan
        const newSdetialAftrSort = forSorting.sort(
          (a, b) => new Date(a.SCHD_PROD_DATE) - new Date(b.SCHD_PROD_DATE)
        );

        // set number of days
        const newDnumber = newSdetialAftrSort.map((ds, i) => ({
          ...ds,
          SCHD_DAYS_NUMBER: i + 1,
          SCHD_HEAD_BALANCE: findSubValue(newSdetialAftrSort, ds, i + 1),
        }));

        newDnumber.forEach(async (newDet) => {
          await WeekSchDetail.update(newDet, {
            where: {
              SCHD_ID: newDet.SCHD_ID,
              SCH_ID: newDet.SCH_ID,
            },
          });
        });

        return res
          .status(200)
          .json({ message: "Updated schedule detail", data: newDnumber });
      }

      const updateSchD = await WeekSchDetail.update(dataSchDetail, {
        where: {
          SCHD_ID: dataSchDetail.SCHD_ID,
          SCH_ID: dataSchDetail.SCH_ID,
        },
      });
      return res
        .status(200)
        .json({ message: "Updated schedule detail", data: updateSchD });
    }

    if (!findExist) return;
    res.status(404).json({ message: "No Data Schedule" });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

//delete detail
export const deleteSchDataDetail = async (req, res) => {
  try {
    const { schId, schdId } = req.params;

    const tryDelete = await WeekSchDetail.destroy({
      where: {
        SCHD_ID: schdId,
      },
    });

    if (!tryDelete) {
      return res.status(404).json({ message: "No Data Schedule Detail" });
    }

    //cari group
    const records = await db.query(QueryGetOneDayliSch, {
      replacements: {
        schId: schId,
      },
      type: QueryTypes.SELECT,
    });

    //cari apakah ada group
    if (records.length > 0) {
      //jika ada masukan databaru dengan group
      const forSorting = [...records].filter((data) => data.SCHD_ID !== schdId);

      //lalu sorting untuk menemukan urutan
      const newSdetialAftrSort = forSorting.sort(
        (a, b) => new Date(a.SCHD_PROD_DATE) - new Date(b.SCHD_PROD_DATE)
      );

      funcUpdateDate(newSdetialAftrSort, schId);

      const newDnumber = newSdetialAftrSort.map((ds, i) => ({
        ...ds,
        SCHD_DAYS_NUMBER: i + 1,
        SCHD_HEAD_BALANCE: findSubValue(newSdetialAftrSort, ds, i + 1),
      }));

      //filter tanpa data baru lalu looping dan post untuk mendapatkan no days number baru
      newDnumber.forEach(async (newDet) => {
        await WeekSchDetail.update(newDet, {
          where: {
            SCHD_ID: newDet.SCHD_ID,
            SCH_ID: newDet.SCH_ID,
          },
        });
      });

      return res.status(200).json({
        message: "Success Delete Schedule Detail",
        data: newDnumber,
      });
    }

    funcUpdateDate([], schId);

    //kalo tidak ada group
    return res.status(200).json({
      message: "Success Delete Schedule Detail No Group",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

//function untuk update data start dan end date
const funcUpdateDate = async (data, schdId) => {
  try {
    if (data.length > 0) {
      const startDay = data[0];
      const finishDay = data[data.length - 1];

      const updateDate = {
        SCH_START_PROD: startDay.SCHD_PROD_DATE,
        SCH_FINISH_PROD: finishDay.SCHD_PROD_DATE,
      };

      return await WeeklyProSchd.update(updateDate, {
        where: {
          SCH_ID: schdId,
        },
      });
    }
    const updateDate = {
      SCH_START_PROD: null,
      SCH_FINISH_PROD: null,
    };

    return await WeeklyProSchd.update(updateDate, {
      where: {
        SCH_ID: schdId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

//function untuk find sub total Header pada tiap detail
function findSubValue(arryDetail, objDetail, daysNum) {
  if (daysNum === 1) return objDetail.SCHD_HEADER_QTY - objDetail.SCHD_QTY;

  const groupHeaderSch = arryDetail.filter((det, i) => i + 1 <= daysNum);

  const nilaiGroupBefore = totalCol(groupHeaderSch, "SCHD_QTY");

  const subDetailValue = objDetail.SCHD_HEADER_QTY - nilaiGroupBefore;
  return subDetailValue;
}