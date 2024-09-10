import { Request, Response } from "express";
import User from "../models/user.model";
import Account from "../models/account.model";

async function createAccount(req: Request, res: Response): Promise<void> {

    try {
        const { userData } = req.body;
        if (!userData) {
            res.status(400).json({ message: 'User data are required' });
            return;
        }

        const existingUserByEmail = await User.findOne({ email: userData.email, isDeleted:false });
        const existingUserByPhone = await User.findOne({ phoneNumber: userData.phoneNumber, isDeleted : false});
        
        if (existingUserByEmail) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }
        
        if (existingUserByPhone) {
            res.status(400).json({ message: 'Phone number already in use' });
            return;
        }
        
        const user = new User(userData);
        await user.save();

        const account = new Account({
            userId: user._id,
        });

        await account.save();

        res.status(201).json({
            message: 'User and account created successfully',
            user,
            account
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
}

async function getAccountById(req: Request, res: Response): Promise<void> {
    try {
        const { accountId } = req.params;

        const account = await Account.findOne({ _id: accountId, isDeleted: false }).populate('userId');
        if (!account) {
            res.status(404).json({ message: 'Account not found or has been deleted' });
            return;
        }

        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

async function updateAccount(req: Request, res: Response): Promise<void> {
    try {
        const { accountId } = req.params;
        const updates = req.body;

        const account = await Account.findByIdAndUpdate(accountId, updates, { new: true });
        if (!account) {
            res.status(404).json({ message: 'Account not found' });
            return;
        }

        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

async function deleteAccount(req: Request, res: Response): Promise<void> {
    console.log("delete account controller called !")
    try {
        const { accountId } = req.params;

        const account = await Account.findById(accountId);
        if (!account) {
            res.status(404).json({ message: 'Account not found' });
            return;
        }

        await Account.findByIdAndUpdate(accountId, { isDeleted: true });

        const user = await User.findById(account.userId);
        if (user) {
            await User.findByIdAndUpdate(account.userId, { isDeleted: true });
        }

        res.status(200).json({ message: 'Account and associated user marked as deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

async function getAllAccounts(req: Request, res: Response): Promise<void> {
    try {
        const { status, isKycVerified } = req.query;

        const filter: any = { isDeleted: false };

        if (status) {
            filter.status = status;
        }

        if (isKycVerified) {
            filter.isKycVerified = isKycVerified;
        }

        const accounts = await Account.find(filter).populate('userId');

        res.status(200).json({
            message: 'Accounts retrieved successfully',
            data: accounts
        });
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

export { createAccount, getAccountById, updateAccount, deleteAccount, getAllAccounts};
