import {
  PoMatrixDelivery,
  QueryGetPOMatrix,
} from "../../../models/production/order.mod.js";
import { read, utils } from "xlsx";
import moment from "moment";
import toArraybuffer from "to-arraybuffer";
import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";

// POST DATA EXCEL FROM UPLOAD PO MATRIX DELIV FROM FE ORDER UPLOAD PAGE
export const postPOMatrixDeliv = async (req, res) => {
  try {
    const dataPMD = req.files;
    //check length data

    if (!dataPMD) {
      return res.status(404).json({
        success: false,
        message: "no data upload!",
        data: dataPMD,
      });
    }

    //we convert array buffer to json here....
    const arrayBufferToJson = (buff) => {
      let arrBuff = toArraybuffer(buff);
      const wb = read(arrBuff, {
        cellNF: false,
        cellText: false,
        cellDates: true,
      });
      const sheets = wb.SheetNames;

      if (sheets.length) {
        let rows = utils.sheet_to_json(wb.Sheets[sheets[0]], {
          raw: false,
        });

        rows = CleanDates(arrBuff, rows, sheets[0], "YYYY-MM-DD", read);
        return rows;
      }
    };

    let dataJson = arrayBufferToJson(dataPMD.file.data);

    if (!dataJson.length)
      return res.status(404).json({ message: "No Data Worksheet" });
    //pakai cara looping
    let siteCode = "";
    let prodMonth = "";
    let customerOrder = "";
    // let pmdData = [];
    //looping, reading, parsing data
    dataJson.forEach(async (pmd, i) => {
      if (
        pmd["Company: PT. SUMBER BINTANG REJEKI"] &&
        pmd["Company: PT. SUMBER BINTANG REJEKI"].indexOf("Site") > -1
      ) {
        siteCode = pmd["Company: PT. SUMBER BINTANG REJEKI"].replace(
          "Site Code:",
          ""
        );
      }
      if (pmd.__EMPTY && pmd.__EMPTY.indexOf("Production Month") > -1) {
        prodMonth = pmd.__EMPTY.replace("Production Month:", "");
      }
      if (pmd.__EMPTY_2) {
        customerOrder = pmd.__EMPTY_2.replace("Customer Order: ", "");
      }
      if (pmd.__EMPTY_3) {
        const dataPmdDetail = {
          SITE_CODE: siteCode.trim(),
          PROD_MONTH: prodMonth.trim(),
          EX_FACTORY: pmd.__EMPTY_9,
          BUYER_CODE: customerOrder.split("/")[0],
          ORDER_NO: customerOrder.split("/")[1],
          ORDER_REF_NO: pmd.__EMPTY_3,
          ORDER_PO_STYLE_REF: pmd.__EMPTY_4,
          COLOR_CODE: pmd.__EMPTY_6,
          COLOR_NAME: pmd.__EMPTY_7,
          SIZE_CODE: pmd.__EMPTY_10,
          TOTAL_QTY: pmd.__EMPTY_26,
        };
        // pmdData.push(dataPmdDetail);
        const findPoCap = await PoMatrixDelivery.findOne({
          where: {
            SITE_CODE: dataPmdDetail.SITE_CODE,
            PROD_MONTH: dataPmdDetail.PROD_MONTH,
            EX_FACTORY: dataPmdDetail.EX_FACTORY,
            BUYER_CODE: dataPmdDetail.BUYER_CODE,
            ORDER_NO: dataPmdDetail.ORDER_NO,
            ORDER_REF_NO: dataPmdDetail.ORDER_REF_NO,
            COLOR_CODE: dataPmdDetail.COLOR_CODE,
            SIZE_CODE: dataPmdDetail.SIZE_CODE,
          },
        });
        if (findPoCap.dataValues) {
          await PoMatrixDelivery.update(dataPmdDetail, {
            where: { PDM_ID: findPoCap.dataValues.PDM_ID },
          });
        } else {
          await PoMatrixDelivery.create(dataPmdDetail);
        }
      }
      if (dataJson.length === i + 1) {
        return res.status(200).json({
          success: true,
          message: "Data Order Retrieved Successfully create",
        });
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

//function for clean Dates
export function CleanDates(buf, oldJSONByPage, sheetName, format, read) {
  //Get the data with dates and parsing the other values like Strings,Integers.
  let newWoorkbook = read(buf, {
    cellNF: false,
    cellText: false,
    cellDates: true,
  });
  let jsonByPage = utils.sheet_to_json(newWoorkbook.Sheets[sheetName], {
    raw: true,
  });

  //Loop the sheet
  for (const index of jsonByPage.keys()) {
    let rowWithDate = jsonByPage[index];
    //Iterate the row
    for (const key in rowWithDate) {
      let value = rowWithDate[key];
      if (value instanceof Date) {
        oldJSONByPage[index][key] = moment(value)
          .add(1, "hours")
          .format(format);
      }
    }
  }
  return oldJSONByPage;
}

//getData PO MATRIX JOIN and where WITH capId
export const getMatrixPoDelivSize = async (req, res) => {
  try {
    const { capId } = req.params;
    const codeCapId = decodeURIComponent(capId);

    // console.log(codeCapId);
    const getPoDelivSize = await db.query(QueryGetPOMatrix, {
      replacements: {
        capId: codeCapId,
      },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(getPoDelivSize);
  } catch (err) {
    res.status(404).json({
      message: "Problem When Get Data PO Matrix Delivery By Capacity ID",
      data: err,
    });
  }
};
