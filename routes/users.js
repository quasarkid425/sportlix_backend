import express from "express";
import {
  userSignupValidator,
  userSigninValidator,
  userResetValidator,
} from "../validiators/auth.js";
import { runValidation } from "../validiators/index.js";
import { isAuth } from "../utils/isAuth.js";
import { isAdmin } from "../utils/isAdmin.js";
import {
  signup,
  login,
  forgot,
  reset,
  getUsersList,
  userInfo,
  userDetails,
  saveCart,
  updateUserProfile,
  getMiles,
} from "../controllers/users.js";

const userRouter = express.Router();

userRouter.get("/userDetails/:id", userDetails);
userRouter.post("/signup", userSignupValidator, runValidation, signup);
userRouter.post("/login", userSigninValidator, runValidation, login);
userRouter.post("/forgot", userResetValidator, runValidation, forgot);
userRouter.post("/reset", reset);
userRouter.get("/info/:userId", userInfo);
userRouter.get("/miles/:zip", getMiles);
userRouter.put("/update/:userId", isAuth, updateUserProfile);
userRouter.put("/saveCart", saveCart);

//Needs authentication
userRouter.get("/usersList", isAuth, isAdmin, getUsersList);

export default userRouter;
