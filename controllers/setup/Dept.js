import Dept from "../../models/setup/dept.mod.js";

export const getDept = async (req, res) => {
  const depts = await Dept.findAll();
  res.json(depts);
};

export const getDeptById = async (req, res) => {
  const depts = await Dept.findAll({
    where: {
      DEP_ID: req.params.id,
    },
  });
  res.json(depts[0]);
};
