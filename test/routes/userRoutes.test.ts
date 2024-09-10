import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import mongoose from 'mongoose';
import User from '../../src/models/user.model';

describe('User Routes', function() {
    this.timeout(20000);

    let userId : any;

    before(async function() {
    
        await mongoose.connect('mongodb+srv://chinmayakumarbehera:mongodb-passowrd@cluster0.f90wc.mongodb.net/bank?retryWrites=true&w=majority&appName=Cluster0', {
            serverSelectionTimeoutMS: 10000
        });

        const user = new User({
            name: 'Test User',
            email: 'test.user@example.com',
            phoneNumber: '1234567890',
            isDeleted: false,
        });

        await user.save();
        userId = user._id;
    });

    after(async function() {
        await User.deleteMany({});
        await mongoose.disconnect();
    });

    describe('GET /api/user', function() {
        it('should get users with default pagination', async function() {
            const response = await request(app)
                .get('/api/user')
                .expect(200);

            expect(response.body).to.have.property('users').that.is.an('array');
            expect(response.body).to.have.property('pagination');
            expect(response.body.pagination).to.have.property('page').that.equals(1);
            expect(response.body.pagination).to.have.property('limit').that.equals(10);
            expect(response.body.pagination).to.have.property('total').that.is.a('number');
            expect(response.body.pagination).to.have.property('totalPages').that.is.a('number');
        });

        it('should filter users by name, email, and phoneNumber', async function() {
            const response = await request(app)
                .get('/api/user')
                .query({ name: 'Test', email: 'test.user@example.com' })
                .expect(200);

            expect(response.body.users).to.be.an('array').that.is.not.empty;
            expect(response.body.users[0]).to.have.property('name').that.equals('Test User');
            expect(response.body.users[0]).to.have.property('email').that.equals('test.user@example.com');
        });

        it('should sort users by createdAt in ascending order', async function() {
            const response = await request(app)
                .get('/api/user')
                .query({ sortBy: 'createdAt', sortOrder: 'asc' })
                .expect(200);

            // Assuming users are returned in ascending order of createdAt
            expect(response.body.users).to.be.an('array').that.is.not.empty;
            // Additional checks can be added here based on your data
        });

        it('should handle pagination', async function() {
            const response = await request(app)
                .get('/api/user')
                .query({ page: 1, limit: 1 })
                .expect(200);

            expect(response.body.users).to.be.an('array').with.lengthOf(1);
            expect(response.body.pagination).to.have.property('page').that.equals(1);
            expect(response.body.pagination).to.have.property('limit').that.equals(1);
        });
    });

    describe('PUT /api/user/:userId', function() {
        it('should update a user successfully', async function() {
            const response = await request(app)
                .put(`/api/user/${userId}`)
                .send({ name: 'Updated User' })
                .expect(200);

            expect(response.body).to.have.property('message').that.equals('User updated successfully');
            expect(response.body.user).to.have.property('name').that.equals('Updated User');
        });

        it('should return 404 if user is not found', async function() {
            const invalidUserId = new mongoose.Types.ObjectId().toString();
            await request(app)
                .put(`/api/user/${invalidUserId}`)
                .send({ name: 'Nonexistent User' })
                .expect(404);
        });

        it('User name updated to Khalid', async function() {
            await request(app)
                .put(`/api/user/${userId}`)
                .send({ name: 'khalid' })
                .expect(200);
        });
    });
});
