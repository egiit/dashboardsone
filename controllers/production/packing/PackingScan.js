import Orders from "../../../models/production/order.mod";
import ScanPacking from "../../../models/setup/production/packing.mod";
import moment from "moment";


// CONTROLLER SCAN PACKING
export const ScanPacking = async (req, res) => {
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
                success: false,
                data: [],
                message: "Barcode Serial not exist!"
            });
        }

        await ScanPacking.update({ PACKING_SCANTIME: datetimenow }, {
            where: {
                BARCODE_SERIAL: barcodeserial
            }
        });

        res.status(200).json({
            success: true,
            data: [],    
            message: "Order Scan Packing Successfully",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};