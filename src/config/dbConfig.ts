import mongoose from 'mongoose';

const URL: string = 'mongodb+srv://chinmayakumarbehera:mongodb-passowrd@cluster0.f90wc.mongodb.net/bank?retryWrites=true&w=majority&appName=Cluster0';

const connectToDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(URL).then(()=>{
            console.log('Successfully connected to MongoDB');
        })
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

export default connectToDatabase;
