import { Orders, ScanCutting } from "../../models/production/cutting.mod.js";
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

// CONTROLLER CREATE NEW ORDER DATA
export const newOrder = async (req, res) => {
    try {
        const {
            buyercode,
            orderno,
            producttype,
            buyerpo,
            mono,
            orderversion,
            shipmentdate,
            orderqty,
            ordercolor,
            ordersize,
            orderstyle,
            barcodeserial,
            siteline
        } = req.body;

        const checkBarcodeSerial = await Orders.findAll({
            attributes: ["BARCODE_SERIAL"],
            where: {
                BARCODE_SERIAL: barcodeserial,
            }
        });

        if (checkBarcodeSerial.length !== 0) {
            return res.status(400).json({
                message: "Barcode Serial exist!"
            });
        }
        
        await ScanCutting.create({
            BARCODE_SERIAL: barcodeserial
        });
        
        await Orders.create({
            BUYER_CODE: buyercode,
            ORDER_NO: orderno,
            PRODUCT_TYPE: producttype,
            BUYER_PO: buyerpo,
            MO_NO: mono,
            ORDER_VERSION: orderversion,
            SHIPMENT_DATE: shipmentdate,
            ORDER_QTY: orderqty,
            ORDER_COLOR: ordercolor,
            ORDER_SIZE: ordersize,
            ORDER_STYLE: orderstyle,
            BARCODE_SERIAL: barcodeserial,
            SITE_LINE: siteline
        });

        
        res.status(201).json({
            success: true,
            data: [],
            message: "Order Data Added Successfully",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};


// CONTROLLER DELETE ORDER
export const deleteOrder = async (req, res) => {
    try {
        await Orders.destroy({
            where: {
                BARCODE_SERIAL: req.params.barcodeserial,
            },
        });
        res.status(200).json({
            success: true,
            data: [],
            message: "Order Delete Successfully",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};


// CONTROLLER SCAN CUTTING
export const QRScanCutting = async (req, res) => {
    try {
        const barcodeserial         = req.body.barcodeserial;
        const datetimenow           = moment().format("YYYY-DD-MM HH:MM:SS");
        
        const checkBarcodeSerial    = await Orders.findAll({
            attributes: ["BARCODE_SERIAL"],
            where: {
                BARCODE_SERIAL: barcodeserial,
            }
        });

        if (checkBarcodeSerial.length == 0) {
            return res.status(400).json({
                success: true,
                data: [],
                message: "Barcode Serial not exist!"
            });
        }

        await ScanCutting.update({CUTTING_SCANTIME: datetimenow}, {
            where: {
                BARCODE_SERIAL: barcodeserial
            }            
        });

        res.status(200).json({
            success: true,
            data: [],
            message: "Order Scan Cutting Successfully",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};