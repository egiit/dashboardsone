import express from "express";
const router = express.Router();

import {
  getUserAcces,
  updateOrCreateUserAccess,
  getViewAccess,
} from "../../controllers/auth/UserAccess.js";

router.get("/:id", getUserAcces);
router.get("/menuview/:id", getViewAccess);
router.post("/:id/:menuid", updateOrCreateUserAccess);

export default router;
