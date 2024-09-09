import { Request, Response } from "express";
import User from "../models/user.model";

async function getUsers(req: Request, res: Response): Promise<void> {
    try {
        const { name, email, phoneNumber, sortBy = 'createdAt', sortOrder = 'asc', page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        const filter: any = { isDeleted: false };
        if (name) filter.name = new RegExp(name as string, 'i');
        if (email) filter.email = new RegExp(email as string, 'i');
        if (phoneNumber) filter.phoneNumber = phoneNumber;

        const sortOptions: any = {}; 
        if (sortBy) sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

        const users = await User.find(filter)
            .sort(sortOptions)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .exec();

        const totalUsers = await User.countDocuments(filter).exec();

        res.status(200).json({
            users,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limitNumber)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

async function updateUser(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }

        const user = await User.findOne({ _id: userId, isDeleted: false });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        Object.assign(user, updateData);
        
        await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

export { getUsers, updateUser };
