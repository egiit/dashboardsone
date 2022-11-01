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

