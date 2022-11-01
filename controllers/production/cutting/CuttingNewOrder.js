import Orders from "../../../models/production/order.mod.js";

// CONTROLLER CREATE NEW ORDER DATA
export const newOrder = async (req, res) => {
    try {
        let existData = [];
        const dataOrder = req.body;

        if (!dataOrder.length){
            return res.status(404).json({
                success: false,
                message: "no data upload!",
                data: dataOrder
            });
        }

        dataOrder.forEach(async (order, i) => {
            const checkBarcodeSerial = await Orders.findAll({
                attributes: ["BARCODE_SERIAL"],
                where: {
                    BARCODE_SERIAL: order.BARCODE_SERIAL,
                },
            });

            if (checkBarcodeSerial.length !== 0) {
                existData.push(...checkBarcodeSerial);
            } else {
                await Orders.create(order);
            }
            
            if (i + 1 === dataOrder.length)
                return res.status(201).json({
                    success: true,
                    message: "Order Data Added Successfully",
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


export default newOrder;