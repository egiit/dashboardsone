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
            data: [],
            message: "Order Delete Successfully",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request"
        });
    }
};

export default deleteOrder;