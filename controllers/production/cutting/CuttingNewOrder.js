import { Orders, ScanCutting } from "../../../models/production/cutting.mod.js";
import moment from "moment";

// CONTROLLER CREATE NEW ORDER DATA
export const newOrder = async (req, res) => {
    try {
        let existData = [];
        const dataOrder = req.body;

        if (!dataOrder.length){
            return res.status(404).json({
                success: false,
                message: "no data upload!",
                data: dataOrder
            });
        }

        dataOrder.forEach(async (order, i) => {
            const checkBarcodeSerial = await Orders.findAll({
                attributes: ["BARCODE_SERIAL"],
                where: {
                    BARCODE_SERIAL: order.BARCODE_SERIAL,
                },
            });

            if (checkBarcodeSerial.length !== 0) {
                existData.push(...checkBarcodeSerial);
            } else {
                await Orders.create(order);
                await ScanCutting.create({
                    BARCODE_SERIAL: order.BARCODE_SERIAL
                });
                
            }

            if (i + 1 === dataOrder.length)
                return res.status(201).json({
                    success: true,
                    message: "Order Data Added Successfully",
                    duplicate: existData,
                });
        });

        /*
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
                success: false,
                message: `insert order data for ${orderno}/${buyerpo}/${mono}${barcodeserial} failed, barcode serial exist!`,
                data: req.body
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
        

        
        res.status(200).json({
            success: true,
            message: `Order Data for ${orderno}/${buyerpo}/${mono}${barcodeserial} Added Successfully`,
            data: []
        });
        */
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error
        });
    }
};


export default newOrder;