import Users from "../../models/setup/users.mod.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = await Users.findAll({
      where: {
        USER_REF_TOKEN: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(403);
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);
        const userId = user[0].USER_ID;
        const username = user[0].USER_NAME;
        const userDept = user[0].USER_DEP;
        const userUnit = user[0].USER_UNIT;
        const userLevel = user[0].USER_LEVEL;
        const accessToken = jwt.sign(
          { userId, username, userLevel, userUnit, userDept },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15s",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
