import Users from "../../models/setup/users.mod.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// export const getUserLogin = async (req, res) =>{
//   const users = await Users.findAll();
//   res.json(users);
// }

export const Login = async (req, res) => {
  try {
    const { USER_NAME, USER_PASS } = req.body;
    const user = await Users.findOne({
      where: {
        USER_NAME: USER_NAME,
      },
    });
    const match = await bcryptjs.compare(USER_PASS, user.USER_PASS);
    // res.json(match);
    if (!match)
      return res
        .status(400)
        .json({ message: "User Name or Password Incorrect" });
    const userId = user.USER_ID;
    const username = user.USER_NAME;
    const userLevel = user.USER_LEVEL;
    const userUnit = user.USER_UNIT;
    const userDept = user.USER_DEP;
    const userMode = user.USER_DARK_MODE;
    const accessToken = jwt.sign(
      { userId, username, userLevel, userDept, userUnit, userMode },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "20s" }
    );
    const refreshToken = jwt.sign(
      { userId, username, userLevel, userDept, userUnit, userMode },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    await Users.update(
      { USER_REF_TOKEN: refreshToken },
      {
        where: {
          USER_ID: userId,
        },
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(404).json({ message: "User Name or Password Incorrect" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  //ambil token di client
  if (!refreshToken) return res.sendStatus(204);
  //jika tidak ada kasih respons forbiden
  const user = await Users.findAll({
    where: {
      USER_REF_TOKEN: refreshToken,
    },
  });
  //ambil token di server
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].USER_ID;
  await Users.update({ USER_REF_TOKEN: null }, { where: { USER_ID: userId } });
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};
