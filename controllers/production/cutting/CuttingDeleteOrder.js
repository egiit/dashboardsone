import { Orders, ScanCutting } from "../../../models/production/cutting.mod.js";

// CONTROLLER DELETE ORDER
export const deleteOrder = async (req, res) => {
    try {
        await Orders.destroy({
            where: {
                BARCODE_SERIAL: req.params.barcodeserial,
            },
        });
        res.status(200).json({
            success: true,
            message: "Order Delete Successfully",
            data: []
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error
        });
    }
};

export default deleteOrder;