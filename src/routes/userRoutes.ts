import express from 'express';
import { getUsers, updateUser } from '../contoller/userController';

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.put("/:userId", updateUser);

export default userRouter;