import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QryGetOrderByCapacity,
  QueryGetOrderRepMo,
  QueryGetOrderStatSize,
} from "../../../models/production/OrderReport.mod.js";

export const getOrderStatusMo = async (req, res) => {
  try {
    const { listMonth } = req.params;

    const months = listMonth.split("-");
    const pland = await db.query(QueryGetOrderRepMo, {
      // const pland = await db.query(QueryDailyPlann, {
      replacements: {
        listMonth: months,
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

export const getOrderStatusSize = async (req, res) => {
  try {
    const { prodMonth, capSite, orderRefPoNo } = req.params;
    const month = decodeURIComponent(prodMonth);
    const site = decodeURIComponent(capSite);
    const po = decodeURIComponent(orderRefPoNo);
    // console.log({ month, site, po });
    const pland = await db.query(QueryGetOrderStatSize, {
      // const pland = await db.query(QueryDailyPlann, {
      replacements: {
        prodMonth: month,
        capSite: site,
        orderRefPoNo: po,
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

export const getOrderByCapacity = async (req, res) => {
  try {
    const { listMonth } = req.params;

    const months = listMonth.split("-");
    const pland = await db.query(QryGetOrderByCapacity, {
      // const pland = await db.query(QueryDailyPlann, {
      replacements: {
        listMonth: months,
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
