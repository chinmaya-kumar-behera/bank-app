import mongoose, { Document, Schema } from 'mongoose';

export interface TransactionInterface extends Document {
    senderAccountNo: mongoose.Types.ObjectId;
    receiverAccountNo: mongoose.Types.ObjectId;
    transactionAmount: number;
    status: string;
    transferType: 'credit' | 'debit';
    paymentMode: 'upi' | 'atm_transfer' | 'bank_transfer';
    isDeleted : boolean,
}

const transactionSchema: Schema = new Schema({
    senderAccountNo: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    receiverAccountNo: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    transactionAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    transferType: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    paymentMode : {
        type: String,
        enum: ['upi', 'atm_transfer', 'bank_transfer']
    },
    isDeleted :{
        type : Boolean,
        default : false,
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model<TransactionInterface>('Transaction', transactionSchema);

export default Transaction;
