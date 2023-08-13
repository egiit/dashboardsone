import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QryGetOrderByCapacity,
  QueryDetailRepSchSize,
  QueryGetOrderRepMo,
  QueryGetOrderStatSize,
  QuerydetailOneCap,
} from "../../../models/production/OrderReport.mod.js";

export const getOrderStatusMo = async (req, res) => {
  try {
    const { listMonth } = req.params;
    // console.log(listMonth);

    const months = listMonth
      .split("-")
      .map((month) => decodeURIComponent(month));

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
    const { prodMonth, capSite, orderRefPoNo, color } = req.params;
    const month = decodeURIComponent(prodMonth);
    const site = decodeURIComponent(capSite);
    const po = decodeURIComponent(orderRefPoNo);
    const colors = decodeURIComponent(color);
    // console.log({ month, site, po });
    const pland = await db.query(QueryGetOrderStatSize, {
      // const pland = await db.query(QueryDailyPlann, {
      replacements: {
        prodMonth: month,
        site: site,
        po: po,
        colors: colors,
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

    const months = listMonth
      .split("-")
      .map((month) => decodeURIComponent(month));
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

export const getDetailOneCap = async (req, res) => {
  try {
    const { idCapacity } = req.params;

    const capDetail = await db.query(QuerydetailOneCap, {
      // const pland = await db.query(QueryDailyPlann, {
      replacements: {
        idCapacity: decodeURIComponent(idCapacity),
      },
      type: QueryTypes.SELECT,
    });
    return res.json(capDetail);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getDetailOneCapSize = async (req, res) => {
  try {
    const { schId } = req.params;

    const capDetailSize = await db.query(QueryDetailRepSchSize, {
      // const pland = await db.query(QueryDailyPlann, {
      replacements: {
        schId: schId,
      },
      type: QueryTypes.SELECT,
    });
    return res.json(capDetailSize);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
