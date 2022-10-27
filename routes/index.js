import express from "express";
import userRoute from "./setup/user.route.js";

import { Login, Logout } from "../controllers/auth/Login.js";
import { refreshToken } from "../controllers/auth/RefreshToken.js";
import userAccesRoute from "./auth/userAccess.route.js";
import getMenu from "../controllers/setup/Menu.js";
import { getDept, getDeptById } from "../controllers/setup/Dept.js";
import cuttingRoute from "./production/cutting.route";

const router = express.Router();

router.post("/login", Login);
router.delete("/logout", Logout);
router.get("/token", refreshToken);
router.get("/menu", getMenu);
router.get("/dept", getDept);
router.get("/dept/:id", getDeptById);
router.use("/useraccess", userAccesRoute);
router.use("/user", userRoute);
router.use("/cutting", cuttingRoute);

router.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

router.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Wrong!!";
  res.status(statusCode).json({ message: err });
});

export default router;
