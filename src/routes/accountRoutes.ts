import express from 'express';
import { createAccount, deleteAccount, getAccountById, getAllAccounts, updateAccount } from '../contoller/accountController';

const accountRouter = express.Router();

accountRouter.get("/", getAllAccounts);
accountRouter.post("/", createAccount);
accountRouter.get("/:accountId", getAccountById);
accountRouter.put("/:accountId", updateAccount);
accountRouter.delete("/:accountId", deleteAccount);

export default accountRouter;