import {ListLampModel} from "../../models/machine/listLamp.mod.js";

export const createLamp = async (req, res) => {
    const { MAC, IP_ADDRESS, ID_SITELINE, IS_ACTIVE } = req.body;

    try {
        if (!MAC) {
            return res.status(400).json({
                success: false,
                message: "MAC address is required",
            });
        }

        const [lamp, created] = await ListLampModel.findOrCreate({
            where: { MAC },
            defaults: {
                IP_ADDRESS,
                ID_SITELINE,
                IS_ACTIVE: IS_ACTIVE ?? false
            }
        });

        if (!created) {
            return res.status(409).json({
                success: false,
                message: "Lamp with this MAC already exists",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Lamp created successfully",
            lamp
        });
    } catch (error) {
        console.error("Error creating lamp:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create lamp: ${error.message}`,
        });
    }
};

export const getAllLamps = async (req, res) => {
    const { isActive, idSiteline } = req.query;
    const where = {};

    if (isActive !== undefined) {
        where.IS_ACTIVE = isActive === 'true' || isActive === true;
    }
    if (idSiteline) {
        where.ID_SITELINE = idSiteline;
    }

    try {
        const lamps = await ListLampModel.findAll({
            where,
            order: [['ID_SITELINE', 'ASC'], ['MAC', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: "Lamps retrieved successfully",
            lamps
        });
    } catch (error) {
        console.error("Error retrieving lamps:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve lamps: ${error.message}`,
        });
    }
};

export const getLampByMac = async (req, res) => {
    const { mac } = req.params;

    try {
        const lamp = await ListLampModel.findByPk(mac);
        if (!lamp) {
            return res.status(404).json({
                success: false,
                message: "Lamp not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lamp retrieved successfully",
            lamp
        });
    } catch (error) {
        console.error("Error retrieving lamp:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve lamp: ${error.message}`,
        });
    }
};

export const updateLamp = async (req, res) => {
    const { mac } = req.params;
    const { IP_ADDRESS, ID_SITELINE, IS_ACTIVE } = req.body;

    try {
        const lamp = await ListLampModel.findByPk(mac);
        if (!lamp) {
            return res.status(404).json({
                success: false,
                message: "Lamp not found",
            });
        }

        await lamp.update({
            IP_ADDRESS: IP_ADDRESS !== undefined ? IP_ADDRESS : lamp.IP_ADDRESS,
            ID_SITELINE: ID_SITELINE !== undefined ? ID_SITELINE : lamp.ID_SITELINE,
            IS_ACTIVE: IS_ACTIVE !== undefined ? IS_ACTIVE : lamp.IS_ACTIVE,
        });

        return res.status(200).json({
            success: true,
            message: "Lamp updated successfully",
        });
    } catch (error) {
        console.error("Error updating lamp:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update lamp: ${error.message}`,
        });
    }
};

export const deleteLamp = async (req, res) => {
    const { mac } = req.params;

    try {
        const lamp = await ListLampModel.findByPk(mac);
        if (!lamp) {
            return res.status(404).json({
                success: false,
                message: "Lamp not found",
            });
        }

        await lamp.destroy();

        return res.status(200).json({
            success: true,
            message: "Lamp deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting lamp:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete lamp: ${error.message}`,
        });
    }
};