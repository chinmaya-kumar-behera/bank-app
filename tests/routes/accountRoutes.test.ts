import mongoose, { mongo } from "mongoose";
import Account from "../../src/models/account.model";
import { expect } from "chai";
import request from 'supertest';
import app from "../../src/app";


describe("Account routers",function(){
    this.timeout(20000);

    let accountId : any;

    after(async function() {
        // await Account.deleteMany();
    })

    describe('POST /api/account/', async function(){

        it("Creation of new account is successfull !", async function (){
        
            const accountResponse = await request(app)
            .post('/api/account')
            .send({
                userData: {
                    email: 'new.user@example.com',
                    phoneNumber: '1238567820',
                    name: 'New User'
                }
            })
            .expect(201);

            expect(accountResponse.body.user).to.have.property("_id");
            accountId = accountResponse.body.account._id;
        })

        it("Creating Account without user data will result 400 Error !", async function (){
            await request(app)
            .post('/api/account')
            .send({
                userData: {
                    email: 'new.user@example.com',
                    phoneNumber: '1238567820',
                    name: 'New User'
                }
            })
            .expect(400);
        })

        it("Duplicate email while creating accout will return 400 error!", async function (){
            const accountResponse = await request(app)
            .post('/api/account')
            .send({})
            .expect(400);
        })

        it("Already existed phone number will result 400 Error !", async function (){
            await request(app)
            .post('/api/account')
            .send({
                userData: {
                    email: 'new2.user@example.com',
                    phoneNumber: '1238567820',
                    name: 'New User'
                }
            })
            .expect(400);
        })

        it("Get the Account Detail", async function (){   
            const response = await request(app)
            .get(`/api/account/${accountId}`)
            .expect(200);
        })

        it("Providing wrong account details result 404 error", async function (){   
            const response = await request(app)
            .get(`/api/account/66dc3f80c28dfb8b0c5c8243`)
            .expect(404);
        })

        it("Get the All Account Details", async function (){   
            const response = await request(app)
            .get(`/api/account`)
            .expect(200);
        })

        it("Get the All Account Details by adding query", async function (){   
            const response = await request(app)
            .get(`/api/account`)
            .query({status:"active",isKycVerified:false})
            .expect(200);
        })

        it("Delete the Account", async function (){   
            const response = await request(app)
            .delete(`/api/account/${accountId}`)
            .expect(200);
        })

        it("Trying to delete the non existing account will return 404", async function (){   
            const response = await request(app)
            .delete(`/api/account/66dc3f80c28dfb8b0c5c8243`)
            .expect(404);
        })

        it("Deleting the deleted the Account will result 404", async function (){   
            const response = await request(app)
            .delete(`/api/account/${accountId}`)
            .expect(200);
        })

    })


    it("Updating the deleted the Account will result 404", async function (){   
        const response = await request(app)
        .put(`/api/account/66dc3f80c28dfb8b0c5c8243`).send({})
        .expect(404);
    })

    it('should return 500 and trigger the error block for Update', async () => {
        const originalUpdate = Account.findByIdAndUpdate;
        Account.findByIdAndUpdate = () => { throw new Error('Intentional error'); };
        const response = await request(app)
        .put(`/api/account/66dc3f80c28dfb8b0c5c8243`).send({})
        .expect(500)
        Account.findByIdAndUpdate = originalUpdate;
    });

})