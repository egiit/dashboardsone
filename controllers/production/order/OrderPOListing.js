import { OrderPoListing } from "../../../models/production/order.mod.js";

// CONTROLLER GET ALL ORDER DATA
export const getOrderPOListing = async (req, res) => {
  try {
    const orders = await OrderPoListing.findAll();
    res.status(200).json({
      success: true,
      message: "Data Order Retrieved Successfully",
      data: orders,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

// CONTROLLER CREATE NEW ORDER PO LISTING DATA
export const newOrderPOListing = async (req, res) => {
  try {
    // let existData = [];
    const dataOrder = req.body;

    if (!dataOrder.length) {
      return res.status(404).json({
        success: false,
        message: "no data upload!",
        data: dataOrder,
      });
    }

    dataOrder.forEach(async (order, i) => {
      const checkOrderPOData = await OrderPoListing.findOne({
        where: {
          ORDER_NO: order.ORDER_NO,
          ORDER_STYLE_DESCRIPTION: order.ORDER_STYLE_DESCRIPTION,
          ORDER_PO_ID: order.ORDER_PO_ID,
          // MO_NO: order.MO_NO,
        },
      });

      if (checkOrderPOData) {
        //filter hanya data tanpa prototype Sequelize
        const records = checkOrderPOData.dataValues;
        // console.log(order);
        // console.log(records);
        // Rest in Object Destructuring New Object/Data  PO Listing without Don’t Update Category and Change Name New Cloumn Date
        const {
          MANUFACTURING_SITE,
          CUSTOMER_NAME,
          CUSTOMER_DIVISION,
          CUSTOMER_PROGRAM,
          CUSTOMER_SEASON,
          ORDER_NO,
          // ORDER_REFERENCE_PO_NO,
          PRODUCT_ITEM_CODE,
          ORDER_STYLE_DESCRIPTION,
          ITEM_COLOR_CODE,
          ITEM_COLOR_NAME,
          TARGET_PCD,
          PLAN_EXFACTORY_DATE,
          ORIGINAL_DELIVERY_DATE,
          ...newOrdr
        } = {
          ...order,
        };

        //Join New Data with existing Object/Data
        const joinAfterDecon = { ...records, ...newOrdr };
        if (records.TARGET_PCD !== order.TARGET_PCD)
          joinAfterDecon.NEW_TARGET_PCD = order.TARGET_PCD;

        if (joinAfterDecon.FINAL_DELIVERY_DATE !== order.FINAL_DELIVERY_DATE)
          joinAfterDecon.NEW_FINAL_DELIVERY_DATE = order.FINAL_DELIVERY_DATE;

        if (joinAfterDecon.PLAN_EXFACTORY_DATE !== order.PLAN_EXFACTORY_DATE)
          joinAfterDecon.NEW_PLAN_EXFACTORY_DATE = order.PLAN_EXFACTORY_DATE;

        const updtD = await OrderPoListing.update(joinAfterDecon, {
          where: {
            ORDER_NO: records.ORDER_NO,
            ORDER_STYLE_DESCRIPTION: records.ORDER_STYLE_DESCRIPTION,
            ORDER_PO_ID: records.ORDER_PO_ID,
            // MO_NO: records.MO_NO,
          },
        });
      } else {
        const crtD = await OrderPoListing.create(order);
      }

      if (i + 1 === dataOrder.length)
        return res.status(201).json({
          success: true,
          message: "Order PO Data Added Successfully",
          data: order,
          // duplicate: existData,
        });
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};
