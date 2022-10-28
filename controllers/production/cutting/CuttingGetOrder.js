import { Orders, ScanCutting } from "../../../models/production/cutting.mod.js";
import moment from "moment";

// CONTROLLER GET ALL ORDER DATA
export const getOrder = async (req, res) => {
    try {
        const orders = await Orders.findAll();
        res.status(200).json({
            success: true,
            data: orders,
            message: "Data Order Retrieved Successfully"
        });    
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
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
        res.status(200).json({
            success: true,
            data: orders[0],
            message: "data retrieved successfully"
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};

// CONTROLLER GET ORDER DATA BY BLK NUMBER
export const getOrderByBLK = async (req, res) => {
    try {
        const orders = await Orders.findAll({
            where: {
                ORDER_NO: req.params.orderno,
            },
        });
        res.status(200).json({
            success: true,
            data: orders[0],
            message: "data retrieved successfully"
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};
