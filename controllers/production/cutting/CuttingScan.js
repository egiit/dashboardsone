import { Orders, ScanCutting } from "../../../models/production/cutting.mod.js";
import moment from "moment";


// CONTROLLER SCAN CUTTING
export const QRScanCutting = async (req, res) => {
    try {
        const barcodeserial         = req.body.barcodeserial;
        const datetimenow           = moment().format("YYYY-MM-DD HH:MM:SS");
        
        
        const checkBarcodeSerial    = await Orders.findAll({
            attributes: ["BARCODE_SERIAL"],
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
        } else {
            const checkCuttingScanTime = await ScanCutting.findAll({
                attributes: ["BARCODE_SERIAL", "CUTTING_SCANTIME"],
                where: {
                    BARCODE_SERIAL: barcodeserial,
                }   
            });

            
            if(checkCuttingScanTime[0].CUTTING_SCANTIME != null){
                res.status(200).json({
                    success: true,
                    message: "order already scan on cutting!",
                    data: checkCuttingScanTime
                });    
            } else {
                await ScanCutting.update({CUTTING_SCANTIME: datetimenow}, {
                    where: {
                        BARCODE_SERIAL: barcodeserial
                    }            
                });
        
                res.status(200).json({
                    success: true,
                    data: [],
                    message: "order scan cutting successfully",
                });
            }
        }

        
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};

export default QRScanCutting;