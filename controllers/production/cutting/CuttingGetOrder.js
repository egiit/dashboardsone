import db from "../../../config/database.js";
import Orders from "../../../models/production/order.mod.js";
import { QueryTypes, Op } from "sequelize";
import {
  OrderDetailList,
  SelectOrderNo,
} from "../../../models/production/cutting.mod.js";

// CONTROLLER GET ALL ORDER DATA
// export const getOrder = async (req, res) => {
//     try {
//         const orders = await Orders.findAll();
//         res.status(200).json({
//             success: true,
//             message: "Data Order Retrieved Successfully",
//             data: orders
//         });
//     } catch (error) {
//         res.status(404).json({
//             success: false,
//             message: "error processing request",
//             data: error
//         });
//     }
// };

export const getCutingOrder = async (req, res) => {
  try {
    const orders = await db.query(OrderDetailList, { type: QueryTypes.SELECT });
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

// CONTROLLER GET ORDER DATA BY BLK NUMBER
// export const getOrderByBLK = async (req, res) => {
//   try {
//     const orders = await Orders.findAll({
//       where: {
//         ORDER_NO: req.params.orderno,
//       },
//     });
//     if (orders.length == 0) {
//       res.status(200).json({
//         success: true,
//         message: "data BLK not found",
//         data: [],
//       });
//     } else {
//       res.status(200).json({
//         success: true,
//         message: "data retrieved successfully",
//         data: orders,
//       });
//     }
//   } catch (error) {
//     res.status(404).json({
//       success: false,
//       message: "error processing request",
//       data: error,
//     });
//   }
// };
export const getOrderByBLK = async (req, res) => {
  try {
    const orders = await db.query(SelectOrderNo, {
      replacements: {
        orderNo: req.params.orderNo,
      },
      type: QueryTypes.SELECT,
    });

    if (orders.length == 0)
      return res.status(200).json({
        success: true,
        message: "data BLK not found",
        data: [],
      });

    return res.status(200).json({
      success: true,
      message: "data retrieved successfully",
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
