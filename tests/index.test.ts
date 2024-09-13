import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app'; 
import connectToDatabase from '../src/config/dbConfig';

describe('Checking the Server status ! /', function() {

    describe("Database connection", async function(){
      it("Connecting to database through DB config file is successfull !", function(){
        connectToDatabase();
      })
    })
  
    it('Should return a 200 status and a welcome message "Hello, API is working fine !', function() {
      request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.message).to.equal('Hello, API is working fine !');
        });
    });
  });