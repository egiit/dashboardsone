import express from "express";
import userRoute from "./setup/user.route.js";

import { Login, Logout, LoginQc, LogoutQc } from "../controllers/auth/Login.js";
import {
  refreshToken,
  refreshTokenQc,
} from "../controllers/auth/RefreshToken.js";
import userAccesRoute from "./auth/userAccess.route.js";
import getMenu from "../controllers/setup/Menu.js";
import { getDept, getDeptById } from "../controllers/setup/Dept.js";
import holidaysRoute from "./setup/holidays.route.js";
import orderRoute from "./production/order.route.js";
import cuttingRoute from "./production/cutting.route.js";
import sewingRoute from "./production/sewing.route.js";
import planningRoute from "./production/planning.route.js";
import pocapacityRoute from "./production/poByCap.route.js";
import reportsrouter from "./production/reports.router.js";
import qcroutes from "./production/qc.route.js";
import qcEndlineRoute from "./production/qcEndlineNew.route.js";
import packingroute from "./production/packing.route.js";
import measurement from "./production/measurement.route.js";
import sewDashboard from "./production/sewDashAnytic.router.js";
import { getSites } from "../controllers/production/reports/SewSites.js";

const router = express.Router();

router.get("/test-connection", (req, res) => res.json({ conection: true }));

// router.post("/login", Login);
// router.post("/loginqc", LoginQc);
// router.delete("/logout", Logout);
// router.delete("/logoutqc", LogoutQc);
// router.get("/token", refreshToken);
// router.get("/tokenQc", refreshTokenQc);
// router.get("/menu", getMenu);
// router.get("/dept", getDept);
// router.get("/dept/:id", getDeptById);
// router.use("/useraccess", userAccesRoute);
// router.use("/user", userRoute);
router.use("/holidays", holidaysRoute);
// router.use("/order", orderRoute);
// router.use("/cutting", cuttingRoute);
router.use("/sewing", sewingRoute);
router.use("/qc", qcroutes);
router.use("/reports", reportsrouter);
router.use("/sewdashboard", sewDashboard);
router.get("/list-sites", getSites);

router.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

router.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Wrong!!";
  res.status(statusCode).json({ message: err });
});

export default router;
