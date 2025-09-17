import {MecDownTimeModel, MecListMachine} from "../../models/machine/machine.mod.js"
import {Op} from "sequelize";
import StorageInventoryLogModel from "../../models/storage/StorageInventoryLog.js";
import {EnumStorage} from "../../enum/general.js";

export const createDownTime = async (req, res) => {
    try {
        const { DESCRIPTION, MACHINE_ID, STORAGE_INVENTORY_ID, STORAGE_INVENTORY_NODE_ID, ID_SITELINE, SCHD_ID, USER_ID  } = req.body;


        if (!DESCRIPTION || !MACHINE_ID || !STORAGE_INVENTORY_ID || !ID_SITELINE || !SCHD_ID) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }


        const machine = await MecListMachine.findByPk(MACHINE_ID);
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: "Machine ID not found",
            });
            }


            const existingDowntime = await MecDownTimeModel.findOne({
                where: {
                    MACHINE_ID,
                    STORAGE_INVENTORY_ID,
                    IS_COMPLETE: false,
                    STATUS: "BROKEN"
                },
            });

            if (existingDowntime) {
                return res.status(400).json({
                    success: false,
                    message: "The machine is still being repaired",
                });
            }


            await machine.update({
                STATUS: "BROKEN",
            });


            const newDownTime = await MecDownTimeModel.create({
                START_TIME: new Date(),
                DESCRIPTION,
                MACHINE_ID,
                STORAGE_INVENTORY_NODE_ID,
                STORAGE_INVENTORY_ID,
                ID_SITELINE, SCHD_ID,
                STATUS: "BROKEN",
                IS_COMPLETE: false,
                CREATED_ID: USER_ID,
                CREATED_AT: new Date()
            });

            return res.status(201).json({
                success: true,
                message: "Downtime record created successfully",
                data: newDownTime,
            });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create downtime record: ${error.message}`,
        });
    }
};

export const getAllDownTimes = async (req, res) => {
    try {
        const {machineId, storageInventoryId, mechanicId} = req.query

        const whereCondition = {}

        if (machineId) {
            whereCondition.MACHINE_ID = machineId
        }

        if (storageInventoryId) {
            whereCondition.STORAGE_INVENTORY_ID = storageInventoryId
        }

        if (mechanicId) {
            whereCondition.MECHANIC_ID = mechanicId
        }


        const downTimes = await MecDownTimeModel.findAll();
        return res.status(200).json({
            success: true,
            message: "Downtime records retrieved successfully",
            data: downTimes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve downtime records: ${error.message}`,
        });
    }
};


export const getDownTimeById = async (req, res) => {
    try {
        const { id } = req.params;

        const downTime = await MecDownTimeModel.findByPk(id);
        if (!downTime) {
            return res.status(404).json({
                success: false,
                message: "Downtime record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Downtime record retrieved successfully",
            data: downTime,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve downtime record: ${error.message}`,
        });
    }
};


export const updateDownTime = async (req, res) => {
    try {
        const { id } = req.params;
        const { START_TIME, RESPONSE_TIME, END_TIME, DESCRIPTION, MACHINE_ID, STORAGE_INVENTORY_ID, MECHANIC_ID, ID_SITELINE, SCHD_ID } = req.body;

        const downTime = await MecDownTimeModel.findByPk(id);

        if (!downTime) {
            return res.status(404).json({
                success: false,
                message: "Downtime record not found",
            });
        }


        await downTime.update({
            START_TIME,
            END_TIME,
            RESPONSE_TIME,
            DESCRIPTION,
            MACHINE_ID,
            STORAGE_INVENTORY_ID,
            MECHANIC_ID,
            ID_SITELINE,
            SCHD_ID,
            UPDATED_AT: new Date()
        });

        return res.status(200).json({
            success: true,
            message: "Downtime record updated successfully",
            data: downTime,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update downtime record: ${error.message}`,
        });
    }
};

export const updateStatusOnFix = async (req, res) => {
    try {
        const { STORAGE_INVENTORY_ID, MACHINE_ID,  MECHANIC_ID, USER_ID } = req.body;


        if (!STORAGE_INVENTORY_ID || !MACHINE_ID || !MECHANIC_ID) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }


        const machine = await MecListMachine.findByPk(MACHINE_ID);
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: "Machine ID not found",
            });
        }



        const downTime = await MecDownTimeModel.findOne({
            where: {
                STORAGE_INVENTORY_ID,
                MACHINE_ID,
                IS_COMPLETE: false,
                STATUS: "BROKEN"
            },
        });

        if (!downTime) {
            return res.status(404).json({
                success: false,
                message: "No downtime record created today for this machine and storage inventory",
            });
        }


        await machine.update({
            STATUS: "ON_FIX",
        });


        await MecDownTimeModel.update(
            {
                MECHANIC_ID,
                STATUS: "ON_FIX",
                RESPONSE_TIME: new Date(),
                UPDATED_ID: USER_ID,
                UPDATED_AT: new Date(),
            },
            {
                where: {
                    ID: downTime.ID,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Downtime record status updated to ON_FIX successfully",
            data: downTime,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update downtime status: ${error.message}`,
        });
    }
};

export const updateStatusAction = async (req, res) => {
    try {
        const { STORAGE_INVENTORY_ID, MACHINE_ID, STATUS, USER_ID } = req.body;

        if (!STORAGE_INVENTORY_ID || !MACHINE_ID || !STATUS) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const downTime = await MecDownTimeModel.findOne({
            where: {
                STORAGE_INVENTORY_ID,
                MACHINE_ID,
                IS_COMPLETE: false,
                STATUS: "ON_FIX"
            }
        });

        if (!downTime) {
            return res.status(404).json({
                success: false,
                message: "No downtime record created today for this machine and storage inventory",
            });
        }

        const machine = await MecListMachine.findByPk(MACHINE_ID);
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: "Machine ID not found",
            });
        }

        if (STATUS === "REPLACE") {
            await machine.update({
                STATUS: "BROKEN",
                IS_REPLACE: true,
                STORAGE_INVENTORY_ID: EnumStorage(),
            });
            StorageInventoryLogModel.create({
                STORAGE_INVENTORY_ID: EnumStorage(),
                MACHINE_ID: MACHINE_ID,
                USER_ADD_ID: USER_ID,
                DESCRIPTION: 'REPLACE MACHINE'
            })
        } else {
            await machine.update({
                STATUS: "NORMAL",
                IS_REPLACE: false,
            });
        }

        await MecDownTimeModel.update(
            {
                STATUS,
                UPDATED_AT: new Date(),
                END_TIME: new Date(),
                IS_COMPLETE: true,
                UPDATED_ID: USER_ID,
            },
            {
                where: {
                    ID: downTime.ID,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Downtime record action updated successfully",
            data: downTime,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update downtime action: ${error.message}`,
        });
    }
};

export const deleteDownTime = async (req, res) => {
    try {
        const { id } = req.params;

        const downTime = await MecDownTimeModel.findByPk(id);

        if (!downTime) {
            return res.status(404).json({
                success: false,
                message: "Downtime record not found",
            });
        }


        await downTime.destroy();

        return res.status(200).json({
            success: true,
            message: "Downtime record deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete downtime record: ${error.message}`,
        });
    }
};