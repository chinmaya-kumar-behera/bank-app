import mongoose, { mongo } from "mongoose";
import Account from "../../src/models/account.model";


describe("Account routers",function(){

    let accountId : any;

    before(async function(){

        await mongoose.connect('mongodb+srv://chinmayakumarbehera:mongodb-passowrd@cluster0.f90wc.mongodb.net/bank?retryWrites=true&w=majority&appName=Cluster0', {
            serverSelectionTimeoutMS: 10000
        });

        const newAccount = await Account.create({
            userData: {
                name:" First User",
                email: "first.user@example.com",
                phoneNumber: "1234567890"
            }
        })

        console.log(newAccount);
    })

    after(async function() {
        await Account.deleteMany();
        await mongoose.disconnect();
    })

    describe('GET /api/account/:id');
})