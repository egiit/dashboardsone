import db from "../../../config/database.js";
import { Orders } from "../../../models/production/order.mod.js";
import { QueryTypes, Op } from "sequelize";
import {
  OrderDetailList,
  OrderDetailHeader,
} from "../../../models/production/order.mod.js";

export const getCuttingOrder = async (req, res) => {
  try {
    const orders = await db.query(OrderDetailHeader, {
      replacements: {
        startDate: req.params.startDate,
        endDate: req.params.endDate,
      },
      type: QueryTypes.SELECT,
    });
    res.status(200).json({
      success: true,
      message: "Data Order Retrieved Successfully",
      data: orders,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

// CONTROLLER GET ORDER DATA BY BARCODE SERIAL
export const getOrderByBarcodeSerial = async (req, res) => {
  try {
    const orders = await Orders.findAll({
      where: {
        BARCODE_SERIAL: req.params.barcodeserial,
      },
    });

    if (orders.length == 0) {
      res.status(200).json({
        success: true,
        message: "data barcode serial not found",
        data: [],
      });
    } else {
      res.status(200).json({
        success: true,
        message: "data barcode serial retrieved successfully",
        data: orders,
      });
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

export const getOrderByBLK = async (req, res) => {
  try {
    const orders = await db.query(OrderDetailList, {
      replacements: {
        orderNo: req.params.orderNo,
      },
      type: QueryTypes.SELECT,
    });

    if (orders.length === 0)
      return res.status(200).json({
        success: true,
        message: "data Order not found",
        data: [],
      });

    //distinc size
    const distSize = [
      ...new Map(orders.map((item) => [item["ORDER_SIZE"], item])).values(),
    ].map((size) => size.ORDER_SIZE);
    const distCol = [
      ...new Map(
        orders.map((item) => [item["ITEM_COLOR_NAME"], item])
      ).values(),
    ].map((col) => col.ITEM_COLOR_NAME);

    // console.log(distCol);
    //LOOPING COMBINE SIZE WITH ORDERS
    let orderWithSeq = [];
    distSize.forEach((size) => {
      distCol.forEach((col) => {
        const newList = orders
          .filter(
            (ord) => ord.ORDER_SIZE === size && ord.ITEM_COLOR_NAME === col
          )
          .map((order, i) => ({
            ...order,
            SEQUENCE: !order.SEQUENCE ? i + 1 : order.SEQUENCE,
          }));
        orderWithSeq.push(...newList);
      });
    });

    // console.log(orderWithSeq);

    return res.status(200).json({
      success: true,
      message: "data retrieved successfully",
      data: orderWithSeq,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};
