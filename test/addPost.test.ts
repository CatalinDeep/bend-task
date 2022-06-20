const chai = require('chai');
const chaiHttp = require('chai-http');
require('mocha');

require('dotenv').config();
const dotenv = require('dotenv');
const config = dotenv.config().parsed;
let token = '';
const server = config.TEST_SERVER;
chai.use(chaiHttp);
describe('Add Post Tests', () => {
  it('Login', () => {
    return chai
      .request(server)
      .post('/users/login')
      .send({
        email: config.TEST_EMAIL,
        password: config.TEST_PASSWORD,
      })
      .then((res) => {
        chai.expect(res.status).to.eq(200);
        token = res.body.token;
      });
  });
  it('Missing title', () => {
    return chai
      .request(server)
      .post('/posts/add')
      .set('Authorization', 'bearer ' + token)
      .send({
        content: 'My post content',
      })
      .then((res) => {
        chai.expect(res.status).to.eq(400);
      });
  });
  it('Wrong title format', () => {
    return chai
      .request(server)
      .post('/posts/add')
      .set('Authorization', 'bearer ' + token)
      .send({
        title: 'Title123!@#',
        content: 'My post content',
      })
      .then((res) => {
        chai.expect(res.status).to.eq(400);
      });
  });
  it('Missing content', () => {
    return chai
      .request(server)
      .post('/posts/add')
      .set('Authorization', 'bearer ' + token)
      .send({
        title: 'Title123',
      })
      .then((res) => {
        chai.expect(res.status).to.eq(400);
      });
  });
  it('Too big content', () => {
    return chai
      .request(server)
      .post('/posts/add')
      .set('Authorization', 'bearer ' + token)
      .send({
        title: 'Title123',
        content:
          '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
      })
      .then((res) => {
        chai.expect(res.status).to.eq(400);
      });
  });
});
