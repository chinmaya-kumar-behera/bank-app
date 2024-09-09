import express from 'express';
import { deleteTransaction, getTransactions, makeTansfer } from '../contoller/transactionController';

const transactionRouter = express.Router();

transactionRouter.get("/", getTransactions);
transactionRouter.post("/", makeTansfer);
transactionRouter.delete("/:transactionId", deleteTransaction);

export default transactionRouter;