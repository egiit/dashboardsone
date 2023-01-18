import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import bcryptjs from "bcryptjs";
import {
  QcType,
  QcUsers,
  QueryGetListUserQc,
} from "../../../models/production/quality.mod.js";

//Get List qc type
export const getListQcType = async (req, res) => {
  try {
    const listQcType = await QcType.findAll({});

    return res.status(200).json(listQcType);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//controller Create User
export const createUserQC = async (req, res) => {
  const dataUser = req.body;
  const cekUsername = await QcUsers.findAll({
    attributes: ["QC_USERNAME"],
    where: {
      QC_USERNAME: dataUser.QC_USERNAME,
    },
  });
  // res.json(cekUsername);
  if (cekUsername.length !== 0)
    return res.status(400).json({ message: "Username sudah ada" });
  const hashPassword = await bcryptjs.hash(dataUser.QC_USER_PASSWORD, 10);
  dataUser.QC_USER_PASSWORD = hashPassword;
  await QcUsers.create(dataUser);
  res.json({
    // datanew: resData,
    message: "User Added",
  });
};

//update user
//controller Update User
export const updateUserQc = async (req, res) => {
  const dataUser = req.body;
  const hashPassword = await bcryptjs.hash(dataUser.QC_USER_PASSWORD, 10);
  dataUser.QC_USER_PASSWORD = hashPassword;
  await QcUsers.update(dataUser, {
    where: {
      QC_USER_ID: dataUser.QC_USER_ID,
    },
  });
  res.json({
    message: "User Updated",
  });
};

//controller Delete User QC
export const deleteUserQC = async (req, res) => {
  try {
    await QcUsers.update(req.body, {
      where: {
        QC_USER_ID: req.params.id,
      },
    });
    res.json({
      message: "User Delete",
    });
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//getlist user QC
export const getListUserQc = async (req, res) => {
  try {
    const listUserQc = await db.query(QueryGetListUserQc, {
      type: QueryTypes.SELECT,
    });

    return res.json(listUserQc);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
