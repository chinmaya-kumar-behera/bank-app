import mongoose, { Document, Schema } from "mongoose";

export interface AccountInterface extends Document {
    userId: mongoose.Types.ObjectId;
    balance: number;
    status: string;
    isKycVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    isDeleted : boolean,
}

const accountSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        default: 1000,
    },
    status: { 
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    isKycVerified: {
        type: Boolean,
        default: false,
    },
    isDeleted :{
        type : Boolean,
        default: false,
    }
}, {
    timestamps: true
});

const Account = mongoose.model<AccountInterface>('Account', accountSchema);

export default Account;
