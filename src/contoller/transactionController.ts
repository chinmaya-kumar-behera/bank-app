import { Request, Response } from "express";
import mongoose from 'mongoose';
import Account from "../models/account.model";
import Transaction from "../models/transaction.model";

async function makeTansfer(req: Request, res: Response): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { senderAccountNo, receiverAccountNo, transactionAmount, transferType, paymentMode } = req.body;

        if (!senderAccountNo || !receiverAccountNo || !transactionAmount || !transferType || !paymentMode) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        if (!['credit', 'debit'].includes(transferType)) {
            res.status(400).json({ message: 'Invalid transfer type' });
            return;
        }

        if (!['upi', 'atm_transfer', 'bank_transfer'].includes(paymentMode)) {
            res.status(400).json({ message: 'Invalid payment mode' });
            return;
        }

        const senderAccount = await Account.findOne({ _id: senderAccountNo, isDeleted: false });
        const receiverAccount = await Account.findOne({ _id: receiverAccountNo, isDeleted: false });

        if (!senderAccount) {
            res.status(404).json({ message: 'Sender account not found' });
            return;
        }

        if (!receiverAccount) {
            res.status(404).json({ message: 'Receiver account not found' });
            return;
        }

        if (!senderAccount.isKycVerified) {
            res.status(400).json({ message: 'Your account is not KYC verified' });
            return;
        }

        if(!receiverAccount.isKycVerified){
            res.status(400).json({ message: 'Receiver account is not KYC verified' });
            return;
        }

        if (transferType === 'debit' && senderAccount.balance < transactionAmount) {
            res.status(400).json({ message: 'Insufficient balance for this transaction' });
            return;
        }



        
            if (transferType === 'debit') {
                senderAccount.balance -= transactionAmount;
                receiverAccount.balance += transactionAmount;
            } else if (transferType === 'credit') {
                senderAccount.balance += transactionAmount;
                receiverAccount.balance -= transactionAmount;
            }

            await senderAccount.save({ session });
            await receiverAccount.save({ session });

            const transaction = new Transaction({
                senderAccountNo,
                receiverAccountNo,
                transactionAmount,
                transferType,
                paymentMode,
                status : 'success'
            });

            await transaction.save({ session });

            await session.commitTransaction();
            session.endSession();

            res.status(201).json({
                message: 'Transfer successful',
                transaction
            });

        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        res.status(500).json({ error: error });
    }
}

async function getTransactions(req: Request, res: Response): Promise<void> {
    try {
        const { senderAccountNo, receiverAccountNo, status, transferType, paymentMode } = req.query;

        const filter: any = { isDeleted: false };
        if (senderAccountNo) filter.senderAccountNo = senderAccountNo; 
        if (receiverAccountNo) filter.receiverAccountNo = receiverAccountNo; 
        if (status) filter.status = status; 
        if (transferType) filter.transferType = transferType; 
        if (paymentMode) filter.paymentMode = paymentMode; 

        const transactions = await Transaction.find(filter);

        res.status(200).json({message:"Transactions fetched successfully !", transactions});
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

async function deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findOne({_id:transactionId, isDeleted:false}); 
        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }

        transaction.isDeleted = true;
        await transaction.save();

        res.status(200).json({ message: 'Transaction deleted', transaction });
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

export { makeTansfer, getTransactions, deleteTransaction };
