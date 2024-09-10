import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import mongoose from 'mongoose';
import User from '../../src/models/user.model';
import Account from '../../src/models/account.model';
import Transaction from '../../src/models/transaction.model';

describe('Account Routes', function() {
    this.timeout(20000);

    let firstAccountId: string;
    let secondAccountId: string;

    before(async function() {
        this.timeout(20000);

        await mongoose.connect('mongodb+srv://chinmayakumarbehera:mongodb-passowrd@cluster0.f90wc.mongodb.net/bank?retryWrites=true&w=majority&appName=Cluster0', {
            serverSelectionTimeoutMS: 10000
        });

        const firstAccountResponse = await request(app)
            .post('/api/account')
            .send({
                userData: {
                    email: 'first.user9@example.com',
                    phoneNumber: '1238567810',
                    name: 'First User'
                }
            })
            .expect(201);

        firstAccountId = firstAccountResponse.body.account._id;
        console.log('First account created successfully');

        const secondAccountResponse = await request(app)
            .post('/api/account')
            .send({
                userData: {
                    email: 'second.user8@example.com',
                    phoneNumber: '0987654321',
                    name: 'Second User',
                }
            })
            .expect(201);
        
        secondAccountId = secondAccountResponse.body.account._id;
    });

    after(async function() {
        // Clean up the database
        await Account.deleteMany({});  // Adjust if your model name/path is different
        await User.deleteMany({});  // Adjust if your model name/path is different
        await Transaction.deleteMany({});  // Adjust if your model name/path is different
        
        // Disconnect from the database
        await mongoose.disconnect();
    });

    it('created two accounts successfully', function() {
        expect(firstAccountId).to.be.a('string').that.is.not.empty;
        expect(secondAccountId).to.be.a('string').that.is.not.empty;
    });

    it('first account got verified', async function() {
        await request(app)
            .put(`/api/account/${firstAccountId}`)
            .send({ isKycVerified: true })
            .expect(200);
    });

    it('second account got verified', async function() {
        await request(app)
            .put(`/api/account/${secondAccountId}`)
            .send({ isKycVerified: true })
            .expect(200);
    });

    it('Transaction successful between two accounts.', async function() {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: firstAccountId,
                receiverAccountNo: secondAccountId,
                transactionAmount: 999,
                transferType: 'debit',
                paymentMode: 'upi'
            })
            .expect(201);

        expect(response.body.message).to.equal('Transfer successful');
    });
});
