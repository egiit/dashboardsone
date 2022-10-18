import express from "express";
import userRoute from "./setup/user.route.js";
import { Login, Logout } from "../controllers/auth/Login.js";
import { refreshToken } from "../controllers/auth/RefreshToken.js";

const router = express.Router();

router.post("/login", Login);
router.delete("/logout", Logout);
router.get("/token", refreshToken);

router.use("/user", userRoute);

router.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 400));
});

router.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Wrong!!";
  res.status(statusCode).json({ message: err });
});

export default router;
