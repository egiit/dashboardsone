import { QueryTypes } from "sequelize";
import db from "../../../config/database.js";

//query get plan vs actual output sew
export const getSites = async (req, res) => {
  try {
    const sites = await db.query(
      "SELECT DISTINCT a.SITE id, a.SITE_NAME value, a.CUS_NAME name FROM item_siteline a",
      {
        type: QueryTypes.SELECT,
      }
    );

    return res.status(200).json({
      success: true,
      data: sites,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sitest",
      data: error,
    });
  }
};
