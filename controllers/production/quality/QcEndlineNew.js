import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  EndlineUndoNew,
  QryCheckTtlCheck,
  QryListQrDefect,
  QryQrSelectCheckResult,
  QueryEndSumSchSize,
  QueryGetLastRepairdNew,
  QueryGetLastRttDefBSNew,
  QueryGetLogEndline,
  QueryGetQrPendNew,
  QueryQcEndlineDailyNew,
  QueryQrEndlineActive,
  getListSplitQr,
} from "../../../models/production/qcEndlineNew.mod.js";
import { QcEndlineOutput } from "../../../models/production/quality.mod.js";
import { CheckNilai } from "../../util/Utility.js";
import {
  ScanSewingOut,
  ScanSewingQrSplit,
} from "../../../models/production/sewing.mod.js";
import { WeekSchDetail } from "../../../models/planning/weekLyPlan.mod.js";
import moment from "moment";

//get list schedule size
export const getEndlineSchSize = async (req, res) => {
  try {
    const { schDate, sitename, linename } = req.params;
    const dataPlanBysize = await db.query(QueryEndSumSchSize, {
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

export const getQrListActive = async (req, res) => {
  try {
    const { schDate, sitename, linename } = req.params;
    const dataPlanBysize = await db.query(QueryQrEndlineActive, {
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

//qet qr list pennding
export const getQrListPenddingNew = async (req, res) => {
  try {
    const { schDate, sitename, linename } = req.params;
    const endDate = moment().subtract(1, "days").format("YYYY-MM-DD");
    const startDate = moment().subtract(60, "days").format("YYYY-MM-DD");

    const dataPlanBysize = await db.query(QueryGetQrPendNew, {
      replacements: { schDate, startDate, endDate, sitename, linename },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: dataPlanBysize,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data planning by size pendding",
      data: error,
    });
  }
};

export const getQrSelected = async (req, res) => {
  try {
    const { barcodeSerial } = req.params;
    const dataPlanBysize = await db.query(QryQrSelectCheckResult, {
      replacements: { barcodeSerial },
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

export const getQrDefectList = async (req, res) => {
  try {
    const { barcodeSerial } = req.params;
    const qrDefectList = await db.query(QryListQrDefect, {
      replacements: { barcodeSerial },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json(qrDefectList);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data planning by size",
      data: error,
    });
  }
};

//fot endline output GOOD/DEF/REJ/BS/
export const postEndlineQc = async (req, res) => {
  try {
    const dataGood = req.body;

    const checkQty = await db.query(QryCheckTtlCheck, {
      replacements: {
        barcodeSerial: dataGood.BARCODE_SERIAL,
      },
      type: QueryTypes.SELECT,
    });
    // console.log(checkQty);
    if (checkQty.length > 0) {
      //tambahkan total check dengan qty yang akan di post
      const newTotCheck =
        parseInt(CheckNilai(dataGood.ENDLINE_OUT_QTY)) +
        parseInt(CheckNilai(checkQty[0].TOTAL_CHECKED));

      const sewingIn = parseInt(CheckNilai(checkQty[0].ORDER_QTY));

      //check jika total new check melebihi sewing in reject
      if (newTotCheck > sewingIn) {
        return res.status(404).json({
          message: "QC Output Tidak Bisa Melebihi Total QTY Loading",
        });
      }
    }

    const postDataGood = await QcEndlineOutput.create(dataGood);
    handleAddUndoNew(dataGood);
    return res.json(postDataGood);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//conrol for repair
export const rapairedPost = async (req, res) => {
  try {
    const dataRepaird = req.body;
    if (dataRepaird.length < 0)
      return res.status(404).json({
        message: "Tidak ada Data Repaired",
        data: error,
      });

    // console.log(dataRepaird);
    dataRepaird.forEach(async (repair, i) => {
      await QcEndlineOutput.update(
        {
          ENDLINE_REPAIR: "Y",
          ENDLINE_ACT_RPR_SCHD_ID: repair.ENDLINE_ACT_RPR_SCHD_ID,
        },
        { where: { ENDLINE_OUT_ID: repair.ENDLINE_OUT_ID } }
      );
      // console.log(repair);
      handleAddUndoNew({ ...repair, ENDLINE_OUT_TYPE: "REPAIR" });
      if (i + 1 === dataRepaird.length) {
        return res.status(200).json({ message: "Repaired Berhasil" });
      }
    });
  } catch (error) {
    return res.status(404).json({
      message: "error processing repaired",
      data: error,
    });
  }
};

//funtion untuk mendambahkan qty undo
async function handleAddUndoNew(data) {
  const checkEndUndo = await EndlineUndoNew.findOne({
    where: {
      BARCODE_SERIAL: data.BARCODE_SERIAL,
      USER_ID: data.ENDLINE_ADD_ID,
    },
  });

  if (!checkEndUndo) {
    const newUndo = {
      UNDO_ID: `${data.BARCODE_SERIAL}.${data.ENDLINE_ADD_ID}`,
      BARCODE_SERIAL: data.BARCODE_SERIAL,
      SCHD_ID: data.ENDLINE_SCHD_ID,
      USER_ID: data.ENDLINE_ADD_ID,
      ADD_ID: data.ENDLINE_ADD_ID,
      UNDO_RTT: data.ENDLINE_OUT_TYPE === "RTT" ? 1 : 0,
      UNDO_DEFECT: data.ENDLINE_OUT_TYPE === "DEFECT" ? 1 : 0,
      UNDO_BS: data.ENDLINE_OUT_TYPE === "BS" ? 1 : 0,
      UNDO_REPAIR: data.ENDLINE_OUT_TYPE === "REPAIR" ? 1 : 0,
    };
    return await EndlineUndoNew.create(newUndo);
  }

  if (checkEndUndo) {
    const {
      UNDO_ID,
      SCHD_ID,
      USER_ID,
      UNDO_RTT,
      UNDO_DEFECT,
      UNDO_BS,
      UNDO_REPAIR,
    } = checkEndUndo.dataValues;
    switch (data.ENDLINE_OUT_TYPE) {
      case "RTT":
        if (UNDO_RTT < 3) {
          return updateUndo(
            { UNDO_RTT: UNDO_RTT + 1 },
            { UNDO_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "DEFECT":
        if (UNDO_DEFECT < 3) {
          return updateUndo(
            { UNDO_DEFECT: UNDO_DEFECT + 1 },
            { UNDO_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "BS":
        if (UNDO_BS < 3) {
          return updateUndo(
            { UNDO_BS: UNDO_BS + 1 },
            { UNDO_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "REPAIR":
        if (UNDO_REPAIR < 3) {
          return updateUndo(
            { UNDO_REPAIR: UNDO_REPAIR + 1 },
            { UNDO_ID, SCHD_ID, USER_ID }
          );
        }
        break;

      default:
        break;
    }
  }
}

//for update add or min undo
async function updateUndo(dataUpdate, dataWhere) {
  return await EndlineUndoNew.update(dataUpdate, {
    where: dataWhere,
  }).catch((err) => console.log(err));
}

//get undoCount
export async function getUndoCount(req, res) {
  try {
    const { barcodeSerial, userQc } = req.params;
    const dataUndo = await EndlineUndoNew.findOne({
      where: {
        BARCODE_SERIAL: barcodeSerial,
        USER_ID: userQc,
      },
    });

    return res.status(200).json(dataUndo);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing repaired",
      data: error,
    });
  }
}

//function handle exe undo
export const handleExeUndo = async (req, res) => {
  try {
    const dataUndo = req.body;

    let queryFind =
      dataUndo.ENDLINE_OUT_TYPE === "REPAIR"
        ? QueryGetLastRepairdNew
        : QueryGetLastRttDefBSNew;

    const findLastPost = await db.query(queryFind, {
      replacements: {
        barcodeSerial: dataUndo.BARCODE_SERIAL,
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
          { ENDLINE_REPAIR: null, ENDLINE_ACT_RPR_SCHD_ID: null },
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
      message:
        "Tidak ada data untuk di Undo atau tidak bisa Undo Data Hari Sebelumnya",
      // message: "No Data For Undo ",
    });
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get Undo",
      data: error,
    });
  }
};

//funtion untuk mendambahkan qty undo
async function handleMinUndo(data) {
  // console.log(data);
  const checkEndUndo = await EndlineUndoNew.findOne({
    where: {
      BARCODE_SERIAL: data.BARCODE_SERIAL,
      USER_ID: data.USER_ID,
    },
  });

  if (checkEndUndo) {
    const {
      UNDO_ID,
      SCHD_ID,
      USER_ID,
      UNDO_RTT,
      UNDO_DEFECT,
      UNDO_BS,
      UNDO_REPAIR,
    } = checkEndUndo.dataValues;
    switch (data.ENDLINE_OUT_TYPE) {
      case "RTT":
        if (UNDO_RTT > 0) {
          return updateUndo(
            { UNDO_RTT: UNDO_RTT - 1 },
            { UNDO_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "DEFECT":
        if (UNDO_DEFECT > 0) {
          return updateUndo(
            { UNDO_DEFECT: UNDO_DEFECT - 1 },
            { UNDO_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "BS":
        if (UNDO_BS > 0) {
          return updateUndo(
            { UNDO_BS: UNDO_BS - 1 },
            { UNDO_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "REPAIR":
        if (UNDO_REPAIR > 0) {
          return updateUndo(
            { UNDO_REPAIR: UNDO_REPAIR - 1 },
            { UNDO_ID, SCHD_ID, USER_ID }
          );
        }
        break;

      default:
        break;
    }
  }
}

export const addAndTransferSplit = async (req, res) => {
  try {
    const dataSplit = req.body;
    const bulkSplit = await ScanSewingQrSplit.bulkCreate(dataSplit);

    if (bulkSplit) {
      await ScanSewingOut.create(dataSplit[0]).then(() => {
        return res.status(200).json({
          success: true,
          message: "QR Split and Transfer Success",
        });
      });
    } else {
      return res.status(404).json({
        message: "error processing split",
        data: error,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing Split and transfer",
      data: error,
    });
  }
};

export const getListQrSplit = async (req, res) => {
  try {
    const { barcodeSerial } = req.params;

    const lisqQRsplit = await db.query(getListSplitQr, {
      replacements: {
        barcodeSerial: barcodeSerial,
      },
      type: QueryTypes.SELECT,
    });
    return res.status(200).json(lisqQRsplit);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get qr split",
      data: error,
    });
  }
};

//sewing out split qr
//function for qr Transfer / Scan sewing out
export async function sewingScanOutQrSplit(req, res) {
  try {
    const dataQr = req.body;

    const checkQrSplit = await ScanSewingQrSplit.findOne({
      where: { BARCODE_SERIAL: dataQr.BARCODE_SERIAL },
    });

    //jika tidak ketemu scan reject
    if (!checkQrSplit) {
      return res.status(200).json({
        success: true,
        qrstatus: "danger",
        message: "Tidak ada QR Split",
      });
    }

    const checkQrScanOut = await ScanSewingOut.findAll({
      where: {
        BARCODE_SERIAL: dataQr.BARCODE_SERIAL,
      },
    });

    //jika ketemu sudah di scan reject
    if (checkQrScanOut.length !== 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "danger",
        message: "QR Sudah transfer",
      });
    } else {
      const transferQr = await ScanSewingOut.create(dataQr);
      if (transferQr) {
        return res.status(200).json({
          success: true,
          qrstatus: "success",
          message: "Transfer Berhasil",
        });
      }
    }

    return res.status(404).json({
      success: false,
      data: error,
      message: "error transfer QR",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
}

//get log input
export const getLogInputQcEndline = async (req, res) => {
  try {
    const { schDate, sitename, linename } = req.params;

    const lisqQRsplit = await db.query(QueryGetLogEndline, {
      replacements: { schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });
    return res.status(200).json(lisqQRsplit);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get log qc endline output",
      data: error,
    });
  }
};

//get log input
export const checkSchdId = async (req, res) => {
  try {
    const { SCHD_ID } = req.params;

    const detailSchedule = await WeekSchDetail.findOne({
      where: { SCHD_ID },
    });

    if (detailSchedule) {
      return res.status(200).json({ existSchedule: true });
    } else {
      return res.status(200).json({ existSchedule: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "Error saat check Schedule",
      data: error,
    });
  }
};

//schedule untuk tablet qc Endline
export const getDailyPlanningQCendNew = async (req, res) => {
  try {
    const { plannDate, sitename, linename, idstieline, shift } = req.params;

    const pland = await db.query(QueryQcEndlineDailyNew, {
      replacements: {
        plannDate: plannDate,
        sitename: sitename,
        linename: linename,
        idstieline: idstieline,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(pland);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
