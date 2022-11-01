import Orders from "../../../models/production/order.mod.js";

// CONTROLLER GET ALL ORDER DATA
export const getOrder = async (req, res) => {
    try {
        const orders = await Orders.findAll();
        res.status(200).json({
            success: true,
            message: "Data Order Retrieved Successfully",
            data: orders
        });    
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error
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
        
        if(orders.length == 0) {
            res.status(200).json({
                success: true,
                message: "data barcode serial not found",
                data: []
            });    
        } else {
            res.status(200).json({
                success: true,
                message: "data barcode serial retrieved successfully",
                data: orders
            });
        }        
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error
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
        if(orders.length==0){
            res.status(200).json({
                success: true,
                message: "data BLK not found",
                data: []
            });
        } else {
            res.status(200).json({
                success: true,
                message: "data retrieved successfully",
                data: orders
            });
        }
        
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error
        });
    }
};
