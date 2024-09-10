import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app'; // Adjust the path as necessary

describe('GET /', function() {
    it('should return a 200 status and a welcome message', function(done) {
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