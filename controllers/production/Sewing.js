import { Orders } from "../../../models/setup/production/cutting.mod";
import { ScanSewing } from "../../../models/setup/production/sewing.mod";
import moment from "moment";


// CONTROLLER SCAN SEWING
export const ScanSewing = async (req, res) => {
    try {
        const barcodeserial = req.body.barcodeserial;
        const datetimenow = moment().format("YYYY-DD-MM HH:MM:SS");
        const checkBarcodeSerial = await Orders.findAll({
            attributes: ["BARCODE_SERIAL"],
            where: {
                BARCODE_SERIAL: barcodeserial,
            }
        });

        if (checkBarcodeSerial.length == 0) {
            return res.status(400).json({
                message: "Barcode Serial not exist!"
            });
        }

        await ScanSewing.update({ SEWING_SCANTIME: datetimenow }, {
            where: {
                BARCODE_SERIAL: barcodeserial
            }
        });

        res.status(200).json({
            message: "Order Scan Sewing Successfully",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};