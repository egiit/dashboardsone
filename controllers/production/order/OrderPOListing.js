import { OrderPoListing } from "../../../models/production/order.mod.js";

// CONTROLLER GET ALL ORDER DATA
export const getOrderPOListing = async (req, res) => {
    try {
        const orders = await OrderPoListing.findAll();
        res.status(200).json({
            success: true,
            message: "Data Order Retrieved Successfully",
            data: orders
        });    
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error
        });   
    }
};

// CONTROLLER CREATE NEW ORDER PO LISTING DATA
export const newOrderPOListing = async (req, res) => {
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
            const checkOrderPOData = await OrderPoListing.findAll({
                attributes: ["ORDER_NO", "ORDER_STYLE_DESCRIPTION", "ORDER_PO_ID", "MO_NO"],
                where: {
                    ORDER_NO: order.ORDER_NO,
                    ORDER_STYLE_DESCRIPTION: order.ORDER_STYLE_DESCRIPTION,
                    ORDER_PO_ID: order.ORDER_PO_ID,
                    MO_NO: order.MO_NO
                },
            });

            if (checkOrderPOData.length !== 0) {
                existData.push(...checkOrderPOData);
            } else {
                await OrderPoListing.create(order);
            }
            
            if (i + 1 === dataOrder.length)
                return res.status(201).json({
                    success: true,
                    message: "Order PO Data Added Successfully",
                    data: order,
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
