import Orders from "../../models/setup/production/orders.mod";

// CONTROLLER GET ALL ORDER DATA
export const getOrder = async (req, res) => {
    const orders = await Orders.findAll();
    res.status(200).json(orders);
};

// CONTROLLER GET ORDER DATA BY BARCODE SERIAL
export const getOrderByBarcodeSerial = async (req, res) => {
    const orders = await Orders.findAll({
        where: {
            BARCODE_SERIAL: req.params.barcodeserial,
        },
    });
    res.status(200).json(orders[0]);
};

// CONTROLLER GET ORDER DATA BY BLK NUMBER
export const getOrderByBLK = async (req, res) => {
    const orders = await Orders.findAll({
        where: {
            ORDER_NO: req.params.orderno,
        },
    });
    res.status(200).json(orders[0]);
};

// CONTROLLER CREATE NEW ORDER DATA
export const newOrder = async (req, res) => {
    const {
        buyercode,
        orderno,
        producttype,
        buyerpo,
        mono,
        orderversion,
        shipmentdate,
        orderqty,
        ordercolor,
        ordersize,
        orderstyle,
        barcodeserial,
        siteline
    } = req.body;
    
    const checkBarcodeSerial = await Orders.findAll({
        attributes: ["BARCODE_SERIAL"],
        where: {
            BARCODE_SERIAL: barcodeserial,
        }       
    });
    if(checkBarcodeSerial.length !== 0){
        return res.status(400).json({ message: "Barcode Serial exist!" });
    }

    await Orders.create({
        BUYER_CODE: buyercode,
        ORDER_NO: orderno,
        PRODUCT_TYPE: producttype,
        BUYER_PO: buyerpo,
        MO_NO: mono,
        ORDER_VERSION: orderversion,
        SHIPMENT_DATE: shipmentdate,
        ORDER_QTY: orderqty,
        ORDER_COLOR: ordercolor,
        ORDER_SIZE: ordersize,
        ORDER_STYLE: orderstyle,
        BARCODE_SERIAL: barcodeserial,
        SITE_LINE: siteline
    });

    res.status(201).json({
        message: "Order Data Added Successfully",
    });
};

// CONTROLLER DELETE ORDER
export const deleteOrder = async (req, res) => {
    await Orders.update(req.body, {
      where: {
        USER_ID: req.params.id,
      },
    });
    res.json({
      message: "User Delete",
    });
  };
  