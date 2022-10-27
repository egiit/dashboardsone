import { Orders } from "../../../models/setup/production/cutting.mod";
import { ScanQuality } from "../../../models/setup/production/quality.mod";
import moment from "moment";


// CONTROLLER SCAN QC
export const ScanQuality = async (req, res) => {
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

        await ScanQuality.update({ QC_SCANTIME: datetimenow }, {
            where: {
                BARCODE_SERIAL: barcodeserial
            }
        });

        res.status(200).json({
            message: "Order Scan Quality Successfully",
        });
    } catch (error) {
        res.status(404).json({
            message: error
        });
    }
};