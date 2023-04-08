import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  MeasChartDetail,
  MeasChartNOrder,
  MeasPOM,
  MeasurementChart,
  QrcChckMeasChartOrdOut,
  QrcChckMeasChartOut,
  QryGetMesByOrder,
  QryMesCheckInput,
  QryMesCheckInputPom,
  QueryBlkForMeasur,
  QueryGetDtilChart,
  QueryGetMesSizelist,
  QueryGetPOM,
  QueryListBuyer,
  QueryLsitStyle,
} from "../../../models/production/measurement.mod.js";

//get data For Measurement
export const getDataBlkForMeasur = async (req, res) => {
  try {
    const { startMonth, endMonth } = req.params;
    const blkFormeasur = await db.query(QueryBlkForMeasur, {
      replacements: { startMonth, endMonth },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: blkFormeasur,
    });
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get data BLK for measurement",
      data: error,
    });
  }
};

//getList Buyer
export const getListBuyer = async (req, res) => {
  try {
    const listBuyer = await db.query(QueryListBuyer, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listBuyer,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get list Buyer",
      data: error,
    });
  }
};

//getList Style by Id BUyer
export const getListStyleByBuyer = async (req, res) => {
  try {
    // const { idBuyer } = req.params;

    const listStyle = await db.query(QueryLsitStyle, {
      // replacements: { idBuyer },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listStyle,
    });
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get list style",
      data: error,
    });
  }
};

export const getMeasurChart = async (req, res) => {
  try {
    const { buyer, style } = req.params;
    const MES_BUYER = decodeURIComponent(buyer).toString();
    const MES_STYLE = decodeURIComponent(style).toString();
    // console.log(MES_BUYER);
    // console.log(MES_STYLE);
    const mesChart = await MeasurementChart.findAll({
      where: { MES_BUYER, MES_STYLE },
    });
    if (mesChart.length === 0) {
      return res.status(202).json({ message: "No Chart Data", data: mesChart });
    }

    return res.status(200).json({ data: mesChart });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data chart",
      data: error,
    });
  }
};

export const CheckChartNo = async (req, res) => {
  try {
    const { MES_CHART_NO } = req.params;

    const findChart = await MeasurementChart.findOne({
      where: { MES_CHART_NO },
    });

    if (findChart) {
      return res.status(202).json({ message: "Chart Number Already Exist" });
    }

    return res.status(200).json({ message: "Can Use" });
  } catch (error) {
    return res.status(404).json({
      message: "error Create New Chart",
      data: error,
    });
  }
};

export const CreatMesChart = async (req, res) => {
  try {
    const { headerNew, detailChart, sizeList } = req.body;
    const { MES_CHART_NO } = headerNew;

    // console.log(headerNew);
    // console.log(detailChart);

    const findChart = await MeasurementChart.findOne({
      where: { MES_CHART_NO },
    });

    if (findChart) {
      return res.status(202).json({ message: "Chart Number Already Exist" });
    }

    const createChart = await MeasurementChart.create(headerNew);

    if (createChart) {
      const dataPom = detailChart.map(function (pom) {
        return {
          MES_CHART_NO: MES_CHART_NO,
          POM_ID: pom.CODE,
          POM_DESC: pom.POM,
          POM_PLUS: pom["TOL +"],
          POM_MIN: pom["TOL -"],
          POM_ORDER: pom.INDEX,
        };
      });

      const creaatPOM = await MeasPOM.bulkCreate(dataPom);

      if (creaatPOM) {
        let chartDetail = [];

        sizeList.forEach(function (sz) {
          detailChart.forEach(function (pom) {
            chartDetail.push({
              MES_CHART_NO: MES_CHART_NO,
              POM_ID: pom.CODE,
              SIZE_CODE: sz,
              SPEC: pom[sz],
            });
          });
        });

        const chartDtl = chartDetail.filter((chr) => chr.SPEC !== undefined);

        const creatDtailCrt = await MeasChartDetail.bulkCreate(chartDtl);
        if (creatDtailCrt)
          return res.status(200).json({ message: "Success Add New Chart" });
      }
      throw error;
    }
    throw error;
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error Create New Chart",
      data: error,
    });
  }
};

export async function getDataChartDtl(req, res) {
  try {
    const { chartNo } = req.params;
    const dataPOM = await db.query(QueryGetPOM, {
      replacements: {
        chartNo,
      },
      type: QueryTypes.SELECT,
    });
    const dataSizeList = await db.query(QueryGetMesSizelist, {
      replacements: {
        chartNo,
      },
      type: QueryTypes.SELECT,
    });
    const dataDtail = await db.query(QueryGetDtilChart, {
      replacements: {
        chartNo,
      },
      type: QueryTypes.SELECT,
    });

    if (dataPOM && dataSizeList && dataDtail) {
      const dataFile = dataPOM.map(function (poms) {
        dataDtail
          .filter((dtl) => dtl.POM_ID === poms.CODE)
          .map(function (dts) {
            poms[dts.SIZE_CODE] = dts.SPEC;
          });
        const newPom = {
          ...poms,
        };
        return newPom;
      });
      const arrSizelisst = dataSizeList.map((sz) => sz.SIZE_CODE);
      const headerFile = Object.keys(dataFile[0]);
      const dataChart = {
        arrSizelisst,
        dataFile,
        headerFile,
      };

      return res.status(200).json({ data: dataChart });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data chart",
      data: error,
    });
  }
}

//update chart untuk update chart posisi update kita input dari detail ke header
// kita pastikan dulu untuk perbedaan data update dan data existing di DB
export const updateChart = async (req, res) => {
  try {
    const { headerNew, detailChart, sizeList } = req.body; //ambil data dari body
    const { MES_CHART_NO } = headerNew;

    const findChart = await MeasurementChart.findOne({
      where: { MES_CHART_NO },
    }); //coba find chart

    // jika chart tidak ada maka return error
    if (!findChart) {
      return res.status(202).json({ message: "Chart Number Not Found" });
    }
    // console.log(sizeList);
    //ambil data db lalu bandingakan  dengan data update dari detail ke pom

    //ekesekusi update
    const updateChart = await MeasurementChart.update(headerNew, {
      where: {
        MES_CHART_NO: MES_CHART_NO,
      },
    });

    if (updateChart) {
      //delete dulu semua pom dan detail
      await MeasPOM.destroy({
        where: {
          MES_CHART_NO: MES_CHART_NO,
        },
      });
      await MeasChartDetail.destroy({
        where: {
          MES_CHART_NO: MES_CHART_NO,
        },
      });

      //lalu create kembali
      const dataPom = detailChart.map(function (pom) {
        return {
          MES_CHART_NO: MES_CHART_NO,
          POM_ID: pom.CODE,
          POM_DESC: pom.POM ? pom.POM : pom.POM_DESC,
          POM_PLUS: pom["TOL +"],
          POM_MIN: pom["TOL -"],
          POM_ORDER: pom.INDEX,
        };
      });

      const creaatPOM = await MeasPOM.bulkCreate(dataPom);

      if (creaatPOM) {
        let chartDetail = [];

        sizeList.forEach(function (sz) {
          detailChart.forEach(function (pom) {
            chartDetail.push({
              MES_CHART_NO: MES_CHART_NO,
              POM_ID: pom.CODE,
              SIZE_CODE: sz,
              SPEC: pom[sz],
            });
          });
        });

        const chartDtl = chartDetail.filter((chr) => chr.SPEC !== undefined);

        const creatDtailCrt = await MeasChartDetail.bulkCreate(chartDtl);
        if (creatDtailCrt) {
          return res.status(200).json({ message: "Success Update New Chart" });
        } else {
          return res.status(404).json({ message: "Error Update" });
        }
      }
      // throw error;
    } else {
      return res.status(404).json({ message: "Error Update" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error Create New Chart",
      data: error,
    });
  }
};

export async function checkDetailSizeOut(req, res, next) {
  try {
    const { headerNew, sizeList } = req.body; //ambil data dari body
    const { MES_CHART_NO } = headerNew;
    const dataSizeList = await db.query(QueryGetMesSizelist, {
      replacements: {
        chartNo: MES_CHART_NO,
      },
      type: QueryTypes.SELECT,
    });

    const checkSizeDlte = dataSizeList.filter(
      (sz) => sizeList.indexOf(sz.SIZE_CODE) < 0
    );
    //check data size jika ada yang tidak sama dengean uplload check sudah output atau blm
    //jika ada ouput return error jika tidak ada maka delete/destroy

    if (checkSizeDlte.length > 0) {
      let alreadyMess = async () => {
        let dataCheck = [];
        for (let sz of checkSizeDlte) {
          const checkInptSz = await db.query(QryMesCheckInput, {
            replacements: {
              chartNo: MES_CHART_NO,
              sizeCode: sz.SIZE_CODE,
            },
            type: QueryTypes.SELECT,
          });

          if (checkInptSz.length > 0) {
            dataCheck.push(...checkInptSz);
          }
        }

        // console.log();
        if (dataCheck.length > 0) {
          return res.status(202).json({
            message: `Can't Delete Size ${dataCheck[0].SIZE_CODE} already production output`,
          });
        } else {
          next();
        }
      };

      alreadyMess();
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error Create New Chart",
      data: error,
    });
  }
}

export async function checkPomBfrUpdate(req, res, next) {
  try {
    const { headerNew, detailChart } = req.body; //ambil data dari body
    const { MES_CHART_NO } = headerNew;
    const dataPOM = await db.query(QueryGetPOM, {
      replacements: {
        chartNo: MES_CHART_NO,
      },
      type: QueryTypes.SELECT,
    });

    const arryPom = detailChart.map((pomz) => pomz.CODE);
    //check pom
    const checkPomDelete = dataPOM.filter(
      (pom) => arryPom.indexOf(pom.CODE) < 0
    );
    // console.log(checkPomDelete);
    if (checkPomDelete.length > 0) {
      let alreadyMess = async () => {
        let dataCheck = [];
        for (let pom of checkPomDelete) {
          const chckPom = await db.query(QryMesCheckInputPom, {
            replacements: {
              chartNo: MES_CHART_NO,
              pomId: pom.CODE,
            },
            type: QueryTypes.SELECT,
          });

          if (chckPom.length > 0) {
            dataCheck.push(...chckPom);
          }
        }

        // console.log();
        if (dataCheck.length > 0) {
          return res.status(202).json({
            message: `Can't Delete POM Code ${dataCheck[0].POM_ID} already production output`,
          });
        } else {
          next();
        }
      };

      alreadyMess();
    } else {
      next();
    }
  } catch (error) {
    return res.status(404).json({
      message: "Something error when check data POM",
      data: error,
    });
  }
}

export async function deleteMeasChart(req, res) {
  try {
    const { chartNo } = req.params;

    const chckChart = await db.query(QrcChckMeasChartOut, {
      replacements: {
        chartNo: chartNo,
      },
      type: QueryTypes.SELECT,
    });

    if (chckChart.length > 0) {
      return res.status(202).json({
        message: `Can't Delete already used on production output`,
      });
    }

    await MeasPOM.destroy({
      where: {
        MES_CHART_NO: chartNo,
      },
    });
    await MeasChartDetail.destroy({
      where: {
        MES_CHART_NO: chartNo,
      },
    });

    await MeasurementChart.destroy({
      where: {
        MES_CHART_NO: chartNo,
      },
    });
    return res.status(200).json({ message: "Delete Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "Something error when check delete Measurement Chart",
      data: error,
    });
  }
}

//chart by PO
export async function getMeasurChartByPO(req, res) {
  try {
    const { orderNo } = req.params;
    if (!orderNo) {
      return res.status(404).json({ message: "No Order Requirment" });
    }

    const listChart = await db.query(QryGetMesByOrder, {
      replacements: { orderNo },
      type: QueryTypes.SELECT,
    });

    if (listChart.length === 0) {
      return res
        .status(202)
        .json({ message: "No Measurement Data For This Order" });
    }

    res.status(200).json({ data: listChart });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data chart",
      data: error,
    });
  }
}

export async function postChartToOrder(req, res) {
  try {
    const datas = req.body;
    if (datas.length === 0) {
      return res.status(404).json({ message: "No Data To Set" });
    }

    let duplicate = [];
    let dataSuccess = [];
    datas.forEach(async (data, i) => {
      const findChart = await MeasChartNOrder.findAll({
        where: {
          MES_CHART_NO: data.MES_CHART_NO,
          ORDER_NO: data.ORDER_NO,
        },
      });

      if (findChart.length > 0) {
        duplicate.push(data.MES_CHART_NO);
      } else {
        const pushSuccs = await MeasChartNOrder.create(data);
        if (pushSuccs) dataSuccess.push(pushSuccs);
      }

      if (i + 1 === datas.length) {
        const messag =
          duplicate.length === 0
            ? "Succeess Add"
            : `Succeess Add Chart : ${
                dataSuccess.length
              } , Duplicate data : ${JSON.stringify(duplicate)}`;

        if (dataSuccess.length === 0) {
          return res
            .status(202)
            .json({ message: "ALL Chart Selected Already Set" });
        }

        return res.status(200).json({ message: messag });
      }
    });
  } catch (error) {
    return res.status(404).json({
      message: "error get data chart",
      data: error,
    });
  }
}

export async function removeChartInOrder(req, res) {
  try {
    const { MES_CHART_NO, ORDER_NO } = req.params;
    const checkChartInOrd = await MeasChartNOrder.findAll({
      where: {
        MES_CHART_NO,
        ORDER_NO,
      },
    });

    if (!checkChartInOrd) {
      return res.status(404).json({ message: "No Data For Remove" });
    }

    const chckChart = await db.query(QrcChckMeasChartOrdOut, {
      replacements: {
        chartNo: MES_CHART_NO,
        orderNo: ORDER_NO,
      },
      type: QueryTypes.SELECT,
    });

    if (chckChart.length > 0) {
      return res.status(404).json({
        message: "Can't Remove, Already Ouput With This Chart NO And Order NO",
      });
    }

    const deslete = await MeasChartNOrder.destroy({
      where: {
        MES_CHART_NO,
        ORDER_NO,
      },
    });
    if (deslete) {
      return res.json({ message: "Success Remove Chart From Order" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error remove chart",
      data: error,
    });
  }
}
