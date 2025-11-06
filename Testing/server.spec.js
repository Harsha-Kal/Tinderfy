

describe('Testing Register API', () => {
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({ id: 5, name: 'John Doe', email: "jdoe@gmail.com"})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });
});










describe('Testing Register API', () => {
  it('positive : /register', done => {
    // Refer above for the positive testcase implementation
  });


  it('Negative : /register. Checking invalid email', done => {
    chai
      .request(server)
      .post('/add_user')
      .send({ id: 5, name: 10, email: 'jdoe' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equals('Invalid email');
        done();
      });
  });
});