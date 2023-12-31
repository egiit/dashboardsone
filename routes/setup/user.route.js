import express from "express";
// import { verifyToken } from '../midleware/VerifyToken.js';
const router = express.Router();
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateUserMode,
} from "../../controllers/setup/users.js";

// router.get('/', verifyToken, getUsers);
router.get("/", getUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.patch("/delete/:id", deleteUser);
router.patch("/mode/:id", updateUserMode);

export default router;
