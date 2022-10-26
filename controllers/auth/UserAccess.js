import moment from "moment";
import { QueryTypes } from "sequelize";

import db from "../../config/database.js";
import {
  UserAcc,
  MenuAccessRole,
  QueryMenuView,
} from "../../models/setup/userAcces.mod.js";

// import { QueryTypes } from 'Sequelize'; //model user

//menuRole
export const getUserAcces = async (req, res) => {
  const userAcces = await db.query(MenuAccessRole, {
    replacements: { id: req.params.id },
    type: QueryTypes.SELECT,
  });
  res.json(userAcces);
};

//Update User Access
export const updateOrCreateUserAccess = async (req, res) => {
  try {
    const foundItem = await UserAcc.findOne({
      where: {
        USER_ID: req.params.id,
        MENU_ID: req.params.menuid,
      },
      order: [["MENU_ID"]],
    });

    const dataAxs = req.body;

    if (!foundItem) {
      // dataAxs.USER_ACESS_ADD_DATE = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
      const item = await UserAcc.create(dataAxs);
      return res.json({
        item: item,
        message: "User Access Added",
      });
    }

    // const dataAxs = req.body;
    // dataAxs.USER_ACESS_MOD_DATE = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
    const item = await UserAcc.update(dataAxs, {
      where: {
        USER_ID: req.params.id,
        MENU_ID: req.params.menuid,
      },
    });

    return res.json({
      item: item,
      message: "User Access Update",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

//
//menu Access View
export const getViewAccess = async (req, res) => {
  const menuViewAccess = await db.query(QueryMenuView, {
    replacements: { userid: req.params.id },
    type: QueryTypes.SELECT,
  });
  if (menuViewAccess.length === 0)
    return res.status(400).json({ message: "Anda Belum Mendapatkan Aksess" });
  res.json(menuViewAccess);
};
