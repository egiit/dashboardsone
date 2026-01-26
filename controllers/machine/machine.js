import {MecDownTimeModel, MecListMachine} from "../../models/machine/machine.mod.js"
import {Op} from "sequelize";
import StorageInventoryLogModel from "../../models/storage/StorageInventoryLog.js";
import {EnumStorage} from "../../enum/general.js";
import {ListLampModel} from "../../models/machine/listLamp.mod.js";
import {QcUsers} from "../../models/production/quality.mod.js";
import db from "../../config/database.js";
import axios from "axios";

export const createDownTime = async (req, res) => {
    const transaction = await db.transaction()
    try {
        const { DESCRIPTION, MACHINE_ID, STORAGE_INVENTORY_ID, STORAGE_INVENTORY_NODE_ID, ID_SITELINE, SCHD_ID, SCH_ID, USER_ID } = req.body;

        if (!DESCRIPTION || !MACHINE_ID || !STORAGE_INVENTORY_ID || !ID_SITELINE || !SCHD_ID) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const machine = await MecListMachine.findOne({
            where: {MACHINE_ID},
            transaction
        });
        if (!machine) {
            await transaction.rollback()
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
            transaction
        });

        if (existingDowntime) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: "The machine is still being repaired",
            });
        }

        await machine.update({ STATUS: "BROKEN" }, {transaction});

        const newDownTime = await MecDownTimeModel.create({
            START_TIME: new Date(),
            DESCRIPTION,
            MACHINE_ID,
            STORAGE_INVENTORY_NODE_ID,
            STORAGE_INVENTORY_ID,
            ID_SITELINE, 
            SCHD_ID,
            SCH_ID,
            STATUS: "BROKEN",
            IS_COMPLETE: false,
            CREATED_ID: USER_ID,
            CREATED_AT: new Date()
        }, {transaction});

        const listLamp = await ListLampModel.findOne({
            where: { ID_SITELINE, IS_WORK: true },
            transaction
        })
        if (listLamp) {
            try {
                await axios.get(`http://${listLamp.IP_ADDRESS}/relay/on`, {timeout: 15000});
                await  listLamp.update({ IS_ACTIVE: true }, { transaction })
            } catch (err) {
                await transaction.rollback()
                return res.status(500).json({
                    success: false,
                    message: `Tolong tekan kembali tombol downtime, karena terdapat gangguan saat menyalakan lampu`,
                });
            }
        }
        await transaction.commit()
        return res.status(201).json({
            success: true,
            message: "Downtime record created successfully",
            data: newDownTime,
        });

    } catch (error) {
        await transaction.rollback()
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
        const {id} = req.params;

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
        const {id} = req.params;
        const {
            START_TIME,
            RESPONSE_TIME,
            END_TIME,
            DESCRIPTION,
            MACHINE_ID,
            STORAGE_INVENTORY_ID,
            MECHANIC_ID,
            ID_SITELINE,
            SCHD_ID
        } = req.body;

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
        const {STORAGE_INVENTORY_ID, MACHINE_ID, MECHANIC_ID, USER_ID} = req.body;


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
    const transaction = await db.transaction();
    try {
        const {STORAGE_INVENTORY_ID, MACHINE_ID, STATUS, USER_ID} = req.body;

        if (!STORAGE_INVENTORY_ID || !MACHINE_ID || !STATUS  || !USER_ID) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const qcUser = await QcUsers.findByPk(USER_ID, {transaction})
        if (!qcUser) {
            await  transaction.rollback()
            return res.status(404).json({
                success: false,
                message: "QC user not found",
            });
        }

        const downTime = await MecDownTimeModel.findOne({
            where: {
                STORAGE_INVENTORY_ID,
                MACHINE_ID,
                IS_COMPLETE: false,
                STATUS: "ON_FIX"
            },
            transaction
        });

        if (!downTime) {
            await  transaction.rollback()
            return res.status(404).json({
                success: false,
                message: "No downtime record created today for this machine and storage inventory",
            });
        }

        const machine = await MecListMachine.findByPk(MACHINE_ID, {transaction});
        if (!machine) {
            await  transaction.rollback()
            return res.status(404).json({
                success: false,
                message: "Machine ID not found",
            });
        }

        if (STATUS === "REPLACE") {
            let inventoryId;
            switch (qcUser.SITE_NAME) {
                case "SBR_01": inventoryId = 168; break;
                case "SBR_02A":
                case "SBR_02B": inventoryId = 173; break;
                case "SBR_03": inventoryId = 174; break;
                case "SBR_04": inventoryId = 175; break;
                default: inventoryId = 168;
            }

            await machine.update({
                STATUS: "BROKEN",
                STORAGE_INVENTORY_ID: inventoryId,
                STORAGE_INVENTORY_NODE_ID: null
            }, {transaction});

            await StorageInventoryLogModel.create({
                STORAGE_INVENTORY_ID:inventoryId,
                MACHINE_ID: MACHINE_ID,
                USER_ADD_ID: USER_ID,
                DESCRIPTION: 'REPLACE MACHINE'
            }, {transaction})
        } else {
            await machine.update({ STATUS: "NORMAL", }, {transaction});
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
                where: {ID: downTime.ID},
                transaction
            }
        );

        const isStillError = await MecDownTimeModel.count({
            where: {
                ID_SITELINE: downTime.ID_SITELINE,
                IS_COMPLETE: false
            },
            transaction
        })

        if (!isStillError) {
            const listLamp = await ListLampModel.findOne({
                where: { ID_SITELINE: downTime.ID_SITELINE, IS_WORK: true },
                transaction
            })

            if (listLamp) {
                try {
                    await axios.get(`http://${listLamp.IP_ADDRESS}/relay/off`, {timeout: 15000});
                    await listLamp.update({ IS_ACTIVE: false }, { transaction })
                } catch (err) {
                    await  transaction.rollback()
                    return res.status(500).json({status: false, message: "Tolong klik lagi matikan downtime, terdapat gangguan sinyal saat mematikan lampu"})
                }
            }
        }

        await  transaction.commit()
        return res.status(200).json({
            success: true,
            message: "Downtime record action updated successfully",
            data: downTime,
        });
    } catch (error) {
        await  transaction.rollback()
        return res.status(500).json({
            success: false,
            message: `Failed to update downtime action: ${error.message}`,
        });
    }
};

export const deleteDownTime = async (req, res) => {
    try {
        const {id} = req.params;

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