import { Orders, ScanCutting } from "../../../models/production/cutting.mod.js";
import moment from "moment";

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


export default newOrder;