import mongoose, { Document, Schema } from 'mongoose';

export interface UserInterface extends Document {
    name: string;
    email: string;
    phoneNumber: string;
    isDeleted : boolean
}

const userSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    isDeleted : {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

const User = mongoose.model<UserInterface>('User', userSchema);

export default User;
