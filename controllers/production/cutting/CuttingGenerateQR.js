import Orders from "../../../models/production/order.mod.js";
import GenerateQR from "../../../models/production/orderqrgenerate.mod.js";
import moment from "moment";

// CONTROLLER GENERATE QR CODE
export const newQRCutting = async (req, res) => {
    try {
        let existData       = [];
        const dataOrder     = req.body;
        const datetimenow   = moment().format("YYYY-MM-DD HH:MM:SS");
        
        if (!dataOrder.length) {
            return res.status(404).json({
                success: false,
                message: "no order qr generated!",
                data: dataOrder
            });
        }

        dataOrder.forEach(async (order, i) => {
            const checkGeneratedQR = await GenerateQR.findAll({
                attributes: ["BARCODE_SERIAL", "BUNDLE_SEQUENCE"],
                where: {
                    BARCODE_SERIAL: order.BARCODE_SERIAL,
                    BUNDLE_SEQUENCE: order.BUNDLE_SEQUENCE
                },
            });

            console.log(datetimenow);

            if (checkGeneratedQR.length !== 0) {
                await GenerateQR.update({ UPDATE_BY: 130 }, {
                    where: {
                        BARCODE_SERIAL: order.BARCODE_SERIAL,
                        BUNDLE_SEQUENCE: order.BUNDLE_SEQUENCE
                    }
                });
            } else {
                await GenerateQR.create({
                    BARCODE_SERIAL: order.BARCODE_SERIAL,
                    BUNDLE_SEQUENCE: order.BUNDLE_SEQUENCE,
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
