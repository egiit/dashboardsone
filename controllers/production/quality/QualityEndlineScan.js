import { Orders } from "../../../models/production/order.mod.js";
// import { ScanQuality } from "../../../models/setup/production/quality.mod";
import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";

// import moment from "moment";
import {
  ManpowewrDailyDetail,
  QuerySewingInQr,
  ScanSewingOut,
} from "../../../models/production/sewing.mod.js";
import {
  getEndllineQROutput,
  PlanSize,
  QcEndlineOutput,
  QueryEndlinePlanSize,
  QueryGetDefForRepair,
  QueryGetLastRepaird,
  QueryGetLastRttDefBS,
  QueryGetListDefect,
  QueryGetListPart,
  QueryGetQrPendding,
  QueryPlanSizePending,
} from "../../../models/production/quality.mod.js";
import { CuttinScanSewingIn } from "../../../models/production/cutting.mod.js";

// Update Actual Manpower Normal / OT
export const SetActualMp = async (req, res) => {
  try {
    const dataPlan = req.body;
    //check manpower on mp_daily_detail
    const findMp = await ManpowewrDailyDetail.findOne({
      where: {
        SCHD_ID: dataPlan.SCHD_ID,
      },
    });
    // if founded
    if (findMp) {
      const updateMp = await ManpowewrDailyDetail.update(dataPlan, {
        where: {
          SCHD_ID: dataPlan.SCHD_ID,
        },
      });
      return res.status(200).json({
        success: true,
        data: updateMp,
        message: "Update Actual Manpower Successfully",
      });
    }
    const create = await ManpowewrDailyDetail.create(dataPlan);
    return res.status(200).json({
      success: true,
      data: create,
      message: "Create Actual Manpower Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//get qr list
export const GetQrSewingIn = async (req, res) => {
  try {
    //line name disini tidak dipakai tapi dipakai untuk tablet
    const { schDate, sitename, linename, barcodeserial } = req.params;

    const listQrAfterScan = await db.query(QuerySewingInQr, {
      replacements: { schDate, sitename, linename, barcodeserial },
      type: QueryTypes.SELECT,
    });

    if (listQrAfterScan)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: listQrAfterScan,
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//getlist Part
export const getListPart = async (req, res) => {
  try {
    const getListPart = await db.query(QueryGetListPart, {
      type: QueryTypes.SELECT,
    });

    return res.json(getListPart);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
//getlist Part
export const getListDefect = async (req, res) => {
  try {
    const listDefect = await db.query(QueryGetListDefect, {
      type: QueryTypes.SELECT,
    });

    return res.json(listDefect);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//fot endline output GOOD/DEF/REJ/BS/
export const postEndlineOutput = async (req, res) => {
  try {
    const dataGood = req.body;
    const postDataGood = await QcEndlineOutput.create(dataGood);
    handleAddUndo(dataGood);
    return res.json(postDataGood);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//function handle undo
export const handleUndo = async (req, res) => {
  try {
    const dataUndo = req.body;

    let queryFind =
      dataUndo.ENDLINE_OUT_TYPE === "REPAIR"
        ? QueryGetLastRepaird
        : QueryGetLastRttDefBS;

    const findLastPost = await db.query(queryFind, {
      replacements: {
        schdid: dataUndo.SCHD_ID,
        type: dataUndo.ENDLINE_OUT_TYPE, //defect ttype
        size: dataUndo.ORDER_SIZE,
        prodtype: dataUndo.type,
      },
      type: QueryTypes.SELECT,
    });

    if (findLastPost[0]) {
      const lastRecod = findLastPost[0];

      if (dataUndo.ENDLINE_OUT_TYPE === "REPAIR") {
        const ekseundoRep = await QcEndlineOutput.update(
          { ENDLINE_REPAIR: null },
          {
            where: {
              ENDLINE_OUT_ID: lastRecod.ENDLINE_OUT_ID,
            },
          }
        );

        if (ekseundoRep) {
          handleMinUndo(dataUndo);
        }
        return res.json({ message: "Success Undo" });
      }

      const ekeundo = await QcEndlineOutput.update(
        { ENDLINE_OUT_UNDO: "Y" },
        {
          where: {
            ENDLINE_OUT_ID: lastRecod.ENDLINE_OUT_ID,
          },
        }
      );
      if (ekeundo) {
        handleMinUndo(dataUndo);
      }

      return res.json({ message: "Success Undo" });
    }

    return res.status(404).json({
      message: "No Data For Undo",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get Undo",
      data: error,
    });
  }
};

//get list plan size for main table
export const getPlanningEendBySize = async (req, res) => {
  try {
    const { schDate, sitename, linename } = req.params;
    const dataPlanBysize = await db.query(QueryEndlinePlanSize, {
      replacements: { schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: dataPlanBysize,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data planning by size",
      data: error,
    });
  }
};

//qc end output presize main button
export const getDataQcEndSizeResult = async (req, res) => {
  try {
    const { schdid, size } = req.params;
    const getQREndlineQty = await db.query(getEndllineQROutput, {
      replacements: { schdid, size },
      type: QueryTypes.SELECT,
    });

    return res.json(getQREndlineQty);
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get data qr qty",
      data: error,
    });
  }
};

//get list defect for Repaired
export const getDefForRepair = async (req, res) => {
  try {
    const { schdid, size } = req.params;
    const getDefList = await db.query(QueryGetDefForRepair, {
      replacements: { schdid, size },
      type: QueryTypes.SELECT,
    });

    return res.json(getDefList);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data Defect qty",
      data: error,
    });
  }
};

//conrol for repair
export const repairedProccess = async (req, res) => {
  try {
    const dataRepaird = req.body;
    if (dataRepaird.length < 0)
      return res.status(404).json({
        message: "No Data Repaird",
        data: error,
      });

    dataRepaird.forEach(async (repair, i) => {
      await QcEndlineOutput.update(
        { ENDLINE_REPAIR: "Y" },
        { where: { ENDLINE_OUT_ID: repair.ENDLINE_OUT_ID } }
      );
      handleAddUndo({ ...repair, ENDLINE_OUT_TYPE: "REPAIR" });
      if (i + 1 === dataRepaird.length) {
        return res.status(200).json({ message: "Repaired Success" });
      }
    });
  } catch (error) {
    return res.status(404).json({
      message: "error processing repaired",
      data: error,
    });
  }
};

//post plansize for undo
export const planSizePost = async (req, res) => {
  try {
    const dataPlanSize = req.body;

    const checkDataPlanSize = await PlanSize.findOne({
      where: {
        SCHD_ID: dataPlanSize.SCHD_ID,
        ORDER_SIZE: dataPlanSize.ORDER_SIZE,
      },
    });

    if (!checkDataPlanSize) {
      delete dataPlanSize.PLANSIZE_MOD_ID;
      const dataplanSizePost = await PlanSize.create(dataPlanSize);
      if (dataplanSizePost) {
        return res.status(200).json({
          staus: "create",
          message: "New Plan Size",
          data: dataplanSizePost,
        });
      }
    }

    delete dataPlanSize.PLANSIZE_ADD_ID;
    const updatePlanSize = await PlanSize.update(dataPlanSize, {
      where: {
        SCHD_ID: dataPlanSize.SCHD_ID,
        ORDER_SIZE: dataPlanSize.ORDER_SIZE,
      },
    });

    if (updatePlanSize) {
      return res.status(200).json({
        staus: "update",
        message: "Update Plan Size",
        data: updatePlanSize,
      });
    }
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing Plan Size",
      data: error,
    });
  }
};

//update plansize after inspection or closed main button
export const planSizeUpdate = async (req, res) => {
  try {
    let dataPlanSize = req.body;
    if (!dataPlanSize.PLANSIZE_ID) {
      return res.status(404).json({
        message: "NO Plan Size ID",
      });
    }
    const totalQty = parseInt(dataPlanSize.QTY);
    const goodQty =
      parseInt(dataPlanSize.RTT) + parseInt(dataPlanSize.REPAIRED);
    // console.log(totalQty);
    // console.log(goodQty);

    dataPlanSize.COMPLETE_STATUS = null;
    dataPlanSize.GOOD = goodQty;

    if (totalQty === goodQty) {
      dataPlanSize.COMPLETE_STATUS = "Y";
    }
    const updatePlanSize = await PlanSize.update(dataPlanSize, {
      where: {
        PLANSIZE_ID: dataPlanSize.PLANSIZE_ID,
      },
    });
    return res.status(200).json({
      staus: "update",
      message: "Update Plan Size After Count",
      data: updatePlanSize,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      data: error,
      message: "error Update Plan Size After Count",
    });
  }
};

//funtion untuk mendambahkan qty undo
async function handleAddUndo(data) {
  const checkDataPlanSize = await PlanSize.findOne({
    where: {
      SCHD_ID: data.ENDLINE_SCHD_ID,
      ORDER_SIZE: data.ENDLINE_PLAN_SIZE,
    },
  });

  if (checkDataPlanSize) {
    const { PLANSIZE_ID, UNDO_RTT, UNDO_DEFECT, UNDO_BS, UNDO_REPAIR } =
      checkDataPlanSize.dataValues;
    switch (data.ENDLINE_OUT_TYPE) {
      case "RTT":
        if (UNDO_RTT < 3) {
          return updateUndo({ UNDO_RTT: UNDO_RTT + 1 }, { PLANSIZE_ID });
        }
        break;
      case "DEFECT":
        if (UNDO_DEFECT < 3) {
          return updateUndo({ UNDO_DEFECT: UNDO_DEFECT + 1 }, { PLANSIZE_ID });
        }
        break;
      case "BS":
        if (UNDO_BS < 3) {
          return updateUndo({ UNDO_BS: UNDO_BS + 1 }, { PLANSIZE_ID });
        }
        break;
      case "REPAIRD":
        if (UNDO_REPAIR < 3) {
          return updateUndo({ UNDO_REPAIR: UNDO_REPAIR + 1 }, { PLANSIZE_ID });
        }
        break;

      default:
        break;
    }
  }
}
//funtion untuk mendambahkan qty undo
async function handleMinUndo(data) {
  const checkDataPlanSize = await PlanSize.findOne({
    where: {
      SCHD_ID: data.SCHD_ID,
      ORDER_SIZE: data.ORDER_SIZE,
    },
  });

  if (checkDataPlanSize) {
    const { PLANSIZE_ID, UNDO_RTT, UNDO_DEFECT, UNDO_BS, UNDO_REPAIR } =
      checkDataPlanSize.dataValues;
    switch (data.ENDLINE_OUT_TYPE) {
      case "RTT":
        if (UNDO_RTT > 0) {
          return updateUndo({ UNDO_RTT: UNDO_RTT - 1 }, { PLANSIZE_ID });
        }
        break;
      case "DEFECT":
        if (UNDO_DEFECT > 0) {
          return updateUndo({ UNDO_DEFECT: UNDO_DEFECT - 1 }, { PLANSIZE_ID });
        }
        break;
      case "BS":
        if (UNDO_BS > 0) {
          return updateUndo({ UNDO_BS: UNDO_BS - 1 }, { PLANSIZE_ID });
        }
        break;
      case "REPAIR":
        if (UNDO_REPAIR > 0) {
          return updateUndo({ UNDO_REPAIR: UNDO_REPAIR - 1 }, { PLANSIZE_ID });
        }
        break;

      default:
        break;
    }
  }
}
//for update add or min undo
async function updateUndo(dataUpdate, dataWhere) {
  await PlanSize.update(dataUpdate, {
    where: dataWhere,
  }).catch((err) => console.log(err));
}

//function for qr Transfer / Scan sewing out
export async function sewingScanOut(req, res) {
  try {
    const dataQr = req.body;
    // console.log(dataQr);

    const checkQrScanIn = await CuttinScanSewingIn.findAll({
      where: {
        BARCODE_SERIAL: dataQr.BARCODE_SERIAL,
      },
    });
    // console.log(checkQrScanIn);

    //jika ketemu sudah di scan reject
    if (checkQrScanIn.length === 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "danger",
        message: "No QR Scan In",
      });
    }

    const checkQrScanOut = await ScanSewingOut.findAll({
      where: {
        BARCODE_SERIAL: dataQr.BARCODE_SERIAL,
      },
    });

    // console.log(checkQrScanOut);
    //jika ketemu sudah di scan reject
    if (checkQrScanOut.length !== 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "danger",
        message: "QR Already transfer",
      });
    }

    const transferQr = await ScanSewingOut.create(dataQr);

    if (transferQr) {
      return res.status(200).json({
        success: true,
        qrstatus: "success",
        message: "Transfer Success",
      });
    }

    return res.status(404).json({
      success: false,
      data: error,
      message: "error transfer QR",
    });
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
}

//get plansize pendding
export const getPlanSizePendding = async (req, res) => {
  try {
    const { schDate, sitename, linename } = req.params;
    const planSizePendding = await db.query(QueryPlanSizePending, {
      type: QueryTypes.SELECT,
      replacements: { schDate, sitename, linename },
    });

    return res.status(200).json({
      success: true,
      data: planSizePendding,
    });
  } catch (error) {
    res.status(404).json({
      message: "error processing request plansize pendding",
      data: error,
    });
  }
};

//get Qr List pendding
export const getQrListPendding = async (req, res) => {
  try {
    const { schDate, sitename, linename } = req.params;
    const qrlistPendding = await db.query(QueryGetQrPendding, {
      type: QueryTypes.SELECT,
      replacements: { schDate, sitename, linename },
    });

    return res.status(200).json({
      success: true,
      data: qrlistPendding,
    });
  } catch (error) {
    res.status(404).json({
      message: "error processing request Qr List pendding",
      data: error,
    });
  }
};
