import Users from "../../models/setup/users.mod.js";
import bcryptjs from "bcryptjs";

//controller Get ALL User
export const getUsers = async (req, res) => {
  const users = await Users.findAll();
  res.json(users);
};

//controller Get User by ID
export const getUserById = async (req, res) => {
  const user = await Users.findAll({
    where: {
      USER_ID: req.params.id,
    },
  });
  res.json(user[0]);
};

//controller Create User
export const createUser = async (req, res) => {
  const dataUser = req.body;
  const cekUsername = await Users.findAll({
    attributes: ["USER_NAME"],
    where: {
      USER_NAME: dataUser.USER_NAME,
    },
  });
  // res.json(cekUsername);
  if (cekUsername.length !== 0)
    return res.status(400).json({ message: "Username sudah ada" });
  const hashPassword = await bcryptjs.hash(dataUser.USER_PASS, 10);
  dataUser.USER_PASS = hashPassword;
  await Users.create(dataUser);
  res.json({
    // datanew: resData,
    message: "User Added",
  });
};

//controller Update User
export const updateUser = async (req, res) => {
  const dataUser = req.body;
  const hashPassword = await bcryptjs.hash(dataUser.USER_PASS, 10);
  dataUser.USER_PASS = hashPassword;
  await Users.update(dataUser, {
    where: {
      USER_ID: req.params.id,
    },
  });
  res.json({
    message: "User Updated",
  });
};

//controller Delete User
export const deleteUser = async (req, res) => {
  await Users.update(req.body, {
    where: {
      USER_ID: req.params.id,
    },
  });
  res.json({
    message: "User Delete",
  });
};
