import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import User from '../../src/models/user.model';
import Account from '../../src/models/account.model';
import Transaction from '../../src/models/transaction.model';

describe('Transaction Routes', function () {
    this.timeout(20000);

    let firstAccountId: string;
    let secondAccountId: string;

    let transactionId: any;

    before(async function () {
        this.timeout(20000);

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

    after(async function () {
        await Account.deleteMany({});
        await User.deleteMany({});
        await Transaction.deleteMany({});
    });

    it('created two accounts successfully', function () {
        expect(firstAccountId).to.be.a('string').that.is.not.empty;
        expect(secondAccountId).to.be.a('string').that.is.not.empty;
    });

    it('Should return Sender account is not verified .', async function () {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: firstAccountId,
                receiverAccountNo: secondAccountId,
                transactionAmount: 999,
                transferType: 'debit',
                paymentMode: 'upi'
            })
            .expect(400);

        expect(response.body.message).to.equal('Your account is not KYC verified');
    });

    it('first account got verified', async function () {
        await request(app)
            .put(`/api/account/${firstAccountId}`)
            .send({ isKycVerified: true })
            .expect(200);
    });

    it('Should return Receiver account is not verified .', async function () {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: firstAccountId,
                receiverAccountNo: secondAccountId,
                transactionAmount: 999,
                transferType: 'debit',
                paymentMode: 'upi'
            })
            .expect(400);
        expect(response.body.message).to.equal('Receiver account is not KYC verified');
    });

    it('second account got verified', async function () {
        await request(app)
            .put(`/api/account/${secondAccountId}`)
            .send({ isKycVerified: true })
            .expect(200);
    });

    it('Debit transaction successful between two accounts.', async function () {
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

        transactionId = response.body.transaction._id;
        expect(response.body.message).to.equal('Transfer successful');
    });

    it('Make transaction of Insufficient balance.', async function () {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: firstAccountId,
                receiverAccountNo: secondAccountId,
                transactionAmount: 9000,
                transferType: 'debit',
                paymentMode: 'upi'
            })
            .expect(400);

        expect(response.body.message).to.equal('Insufficient balance for this transaction');
    });

    it('Credit type transaction successful between two accounts.', async function () {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: firstAccountId,
                receiverAccountNo: secondAccountId,
                transactionAmount: 999,
                transferType: 'credit',
                paymentMode: 'upi'
            })
            .expect(201);

        transactionId = response.body.transaction._id;
        expect(response.body.message).to.equal('Transfer successful');
    });

    it('Making Transaction having wrong payment transfer type.', async function () {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: firstAccountId,
                receiverAccountNo: secondAccountId,
                transactionAmount: 999,
                transferType: 'cash',
                paymentMode: 'upi'
            })
            .expect(400);

        expect(response.body.message).to.equal('Invalid transfer type');
    });

    it('Making Transaction having wrong payment mode.', async function () {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: firstAccountId,
                receiverAccountNo: secondAccountId,
                transactionAmount: 999,
                transferType: 'debit',
                paymentMode: 'cash on delivery'
            })
            .expect(400);

        expect(response.body.message).to.equal('Invalid payment mode');
    });

    it('Making Transaction having insufficient details.', async function () {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: firstAccountId,
            })
            .expect(400);

        expect(response.body.message).to.equal('All fields are required');
    });

    it('Sending a sender account number that doesnot exist.', async function () {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: "66e29576224ea2f562459a40",
                receiverAccountNo: secondAccountId,
                transactionAmount: 1,
                transferType: 'debit',
                paymentMode: 'upi'
            })
            .expect(404);
        expect(response.body.message).to.equal('Sender account not found');
    });

    it('Sending a receiver account number that doesnot exist.', async function () {
        const response = await request(app)
            .post(`/api/transaction`)
            .send({
                senderAccountNo: firstAccountId,
                receiverAccountNo: "66e29576224ea2f562459a40",
                transactionAmount: 1,
                transferType: 'debit',
                paymentMode: 'upi'
            })
            .expect(404);
        expect(response.body.message).to.equal('Receiver account not found');
    });


    describe("GET transactions", async function () {

        it('Get all transactions successfull.', async function () {
            const response = await request(app)
                .get(`/api/transaction`)
                .expect(200);

            expect(response.body.message).to.equal('Transactions fetched successfully !');
        });

        it('should fetch transactions with senderAccountNo filter', async () => {

            const response = await request(app)
                .get('/api/transaction')
                .query({ senderAccountNo: firstAccountId })
                .expect(200);

            expect(response.body).to.have.property('message', 'Transactions fetched successfully !');
            expect(response.body.transactions).to.be.an('array');
            expect(response.body.transactions[0].senderAccountNo).to.equal(firstAccountId);
        });
        
        it('should fetch transactions with multiple filters', async () => {
            const response = await request(app)
                .get('/api/transaction')
                .query({
                    receiverAccountNo: secondAccountId,
                    status: 'success',
                    transferType: 'debit',
                    paymentMode: 'upi'
                })
                .expect(200);
    
            expect(response.body).to.have.property('message', 'Transactions fetched successfully !');
            expect(response.body.transactions).to.be.an('array');
        });

        it('should return 500 and trigger the error block for GET', async () => {
            const originalGet = Transaction.find;
            Transaction.find = () => { throw new Error('Intentional error'); };
            const response = await request(app)
                .get(`/api/transaction`)
                .expect(500);
            expect(response.body).to.have.property('error');
            Transaction.find = originalGet;
        });
    })

    // it('should trigger the outer catch block and return 500 when an error occurs outside the transaction', async () => {
    //     const originalFindOne = Account.findOne;
    //     Account.findOne = () => { throw new Error('Intentional outer error'); };
    
    //     const response = await request(app)
    //         .post('/api/transfer')
    //         .send({
    //             senderAccountNo: firstAccountId,
    //             receiverAccountNo: secondAccountId,
    //             transactionAmount: 100,
    //             transferType: 'debit',
    //             paymentMode: 'upi'
    //         })
    //         .expect(500);   
    //     console.log(response.body);
    //     expect(response.body).to.have.property('error');
    //     expect(response.body.error.message).to.equal('Intentional outer error');
    
    //     Account.findOne = originalFindOne;
    // });


    
    // it('should trigger the inner catch block and return 500 when an error occurs inside the transaction', async () => {
    //     const originalSave = Transaction.prototype.save;
    //     Transaction.prototype.save = () => { throw new Error('Intentional inner error'); };
    
    //     const response = await request(app)
    //         .post('/api/transfer')
    //         .send({
    //             senderAccountNo: firstAccountId,
    //             receiverAccountNo: secondAccountId,
    //             transactionAmount: 100,
    //             transferType: 'debit',
    //             paymentMode: 'upi'
    //         })
    //         .expect(500);  
    
    //     expect(response.body).to.have.property('error');
    //     expect(response.body.error.message).to.equal('Intentional inner error');
    
    //     Transaction.prototype.save = originalSave;
    // });
    
    

    describe("Delete transactions", function () {
        it('Deleting the transaction is successfull !.', async function () {
            const response = await request(app)
                .delete(`/api/transaction/${transactionId}`)
                .expect(200);
            expect(response.body.message).to.equal('Transaction deleted');
        });

        it('Deleting the transaction that is already deleted!.', async function () {
            const response = await request(app)
                .delete(`/api/transaction/${transactionId}`)
                .expect(404);
            expect(response.body.message).to.equal('Transaction not found');
        });

        it('should return 500 and trigger the error block for DELETE', async () => {
            const originalDelete = Transaction.findOne;
            Transaction.findOne = () => { throw new Error('Intentional error'); };
            const response = await request(app)
                .delete(`/api/transaction/${transactionId}`)
                .expect(500);
            expect(response.body).to.have.property('error');
            Transaction.findOne = originalDelete;
        });
    })
});


