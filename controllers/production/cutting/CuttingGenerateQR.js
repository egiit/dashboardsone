import { Orders } from "../../../models/production/order.mod.js";
import { GenerateQR } from "../../../models/production/cutting.mod.js";
import moment from "moment";

// CONTROLLER GENERATE QR CODE
export const newQRCutting = async (req, res) => {
    try {
        let existData       = [];
        const dataOrder     = req.body;
        
        if (!dataOrder.length) {
            return res.status(404).json({
                success: false,
                message: "no order qr generated!",
                data: dataOrder
            });
        }

        dataOrder.forEach(async (order, i) => {
            const checkGeneratedQR = await GenerateQR.findOne({
                where: {
                    BARCODE_SERIAL: order.BARCODE_SERIAL
                },
            });

            
            if (checkGeneratedQR) {
                await GenerateQR.update({ SITE_LINE: order.SITE_LINE, UPDATE_BY: 130 }, {
                    where: {
                        BARCODE_SERIAL: order.BARCODE_SERIAL,
                        BUNDLE_SEQUENCE: order.SEQUENCE
                    }
                });
            } else {
                await GenerateQR.create({
                    BARCODE_SERIAL: order.BARCODE_SERIAL,
                    BUNDLE_SEQUENCE: order.SEQUENCE,
                    SITE_LINE: order.SITE_LINE,
                    CREATE_BY: 130
                });
            }

            if (i + 1 === dataOrder.length)
                return res.status(201).json({
                    success: true,
                    message: "QR Generated Successfully",
                    duplicate: existData,
                });
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error
        });
    }
};
