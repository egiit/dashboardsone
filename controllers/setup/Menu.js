import Menus from "../../models/setup/menus.mod.js";

const getMenu = async (req, res) => {
  const menus = await Menus.findAll();
  // if (menus.length !== 0) {
  //   const menusNoUserId = menus.map(({ USER_ID, ...menu }) => menu);
  //   return res.json(menusNoUserId);
  // }
  res.json(menus);
};

export default getMenu;
