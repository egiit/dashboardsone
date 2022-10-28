import { Orders, ScanCutting } from "../../../models/production/cutting.mod.js";
import ScanSewing from "../../../models/production/sewing.mod.js";
import moment from "moment";


// CONTROLLER SCAN CUTTING
export const QRScanSewing = async (req, res) => {
    try {
        const barcodeserial         = req.body.barcodeserial;
        const datetimenow           = moment().format("YYYY-MM-DD HH:MM:SS");
        
        
        const checkBarcodeSerial    = await Orders.findAll({
            attributes: ["BARCODE_SERIAL"],
            where: {
                BARCODE_SERIAL: barcodeserial,
            }
        });
        
        const checkCuttingScanTime = await ScanCutting.findAll({
            attributes: ["BARCODE_SERIAL", "CUTTING_SCANTIME"],
            where: {
                BARCODE_SERIAL: barcodeserial,
            }   
        });

        const checkSewingScanTime = await ScanSewing.findAll({
            attributes: ["BARCODE_SERIAL", "SEWING_SCANTIME"],
            where: {
                BARCODE_SERIAL: barcodeserial,
            }   
        });

        if (checkBarcodeSerial.length == 0) {
            return res.status(400).json({
                success: true,
                message: "Barcode Serial not exist!",
                data: []
            });
        }
        
        if(checkCuttingScanTime[0].CUTTING_SCANTIME == null){
            res.status(200).json({
                success: true,
                message: "order not yet scan on cutting",
                data: checkCuttingScanTime
            });
        }
        
        if(checkSewingScanTime[0].SEWING_SCANTIME != null){
            res.status(200).json({
                success: true,
                message: "order already scan on sewing!",
                data: checkSewingScanTime
            });
        }
        
        await ScanSewing.update({SEWING_SCANTIME: datetimenow}, {
            where: {
                BARCODE_SERIAL: barcodeserial
            }            
        });

        res.status(200).json({
            success: true,
            data: [],
            message: "order scan sewing successfully",
        });
        
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};

export default QRScanSewing;