// ********************** Initialize server **********************************

const server = require('../ProjectSourceCode/src/main');

// ********************** Import Libraries ***********************************

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

describe('Testing Register API', () => {
  const registrationPayload = {
    username: `testuser_${Date.now()}`,
    password: 'Password123!',
  };

  it('positive: /register', done => {
    chai
      .request(server)
      .post('/register')
      .redirects(0)
      .send(registrationPayload)
      .end((err, res) => {
        expect(res).to.have.status(302);
        res.should.redirectTo(/\/login$/);
        done();
      });
  });

  it('negative: /register duplicate username', done => {
    chai
      .request(server)
      .post('/register')
      .send(registrationPayload)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.text).to.include('Username already exists');
        done();
      });
  });
});

after(() => {
  server.close();
});
