import { Orders, ScanCutting } from "../../../models/production/cutting.mod.js";

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

export default QRScanCutting;