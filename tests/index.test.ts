// import request from 'supertest';
// import { expect } from 'chai';
// import app from '../src/app';
// import connectToDatabase from '../src/config/dbConfig';
// import mongoose from 'mongoose';

// describe('Checking the Server status ! /', function () {

//   describe('Checking the Database connection ', () => {
//     const originalConnect = mongoose.connect;
//     mongoose.connect = ()=> {throw new Error("Internal server Error")};

//     it('should log an error and exit the process if mongoose.connect throws an error', async () => {
//       await connectToDatabase();
//       mongoose.connect = originalConnect
//     });

//     it("Connecting to database through DB config file is successfull !", async function () {
//       await connectToDatabase();
//     })


//     it('Should return a 200 status and a welcome message "Hello, API is working fine !', function () {
//       request(app)
//         .get('/')
//         .expect(200)
//         .expect('Content-Type', /json/)
//         .end((err, res) => {
//           expect(res.body.message).to.equal('Hello, API is working fine !');
//         });
//     });

//   })

// });

import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import connectToDatabase from '../src/config/dbConfig';
import mongoose from 'mongoose';

describe('Checking the Server status ! /', function () {

  describe('Checking the Database connection', () => {
    const originalConnect = mongoose.connect;
    const originalProcessExit = process.exit;

    beforeEach(() => {
      mongoose.connect = async () => { throw new Error('Internal server error') };
      process.exit = (code: number) => { throw new Error(`process.exit called with code ${code}`) };  // Mock process.exit to throw an error
    });

    afterEach(() => {
      // Restore original methods
      mongoose.connect = originalConnect;
      process.exit = originalProcessExit;
    });

    it('should log an error and exit the process if mongoose.connect throws an error', async () => {
      try {
        await connectToDatabase();
      } catch (error: any) {
        // Check that process.exit was called with code 1
        expect(error.message).to.equal('process.exit called with code 1');
      }
    });

    it("should connect to the database successfully", async function () {
      mongoose.connect = originalConnect;  // Restore original connection for this test
      await connectToDatabase();
      // No need to assert anything as we're testing for successful connection
    });

    it('should return a 200 status and a welcome message', function (done) {
      request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.message).to.equal('Hello, API is working fine !');
          done();
        });
    });

  });

});
