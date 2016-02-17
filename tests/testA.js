'use strict';
const BaseController = require('../api/base-controller');
const Sqlite3Model = require('../api/sqlite3-model');
const BaseTest = require('./base-test');
const should = require('should');
const Sqlite3 = require('sqlite3');

class ControllerA extends BaseController {
} // class ModelA

class TestA extends BaseTest {

setupDb() {
  const db = new Sqlite3.Database(':memory:');
  db.serialize(function() {
    db.run("CREATE TABLE testa (a TEXT, b TEXT, c INTEGER)");
  });
  return db;
}

constructor(server) {
  super(server);
  const schema = {
    a: String,
    b: String,
    c: Number
  }

  const db = this.setupDb();
  const table = 'testa';
  const model = new Sqlite3Model(db, table, schema);
  const ctrl = new ControllerA(model);
  global.CrudApi.setController(ctrl);

  const options = {
    word: 'user',
    path: '/api'
  }
  global.CrudApi.install(options);
}

doTest() {
  const self = this;
  describe('Basic', ()=> {
    it('should be able to create a record', (done)=> {
      const request = self.createPostRequest({
        url: 'http://localhost:3030/api/users',
        payload: {
          a:'a', b: 'b', c: 1
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.lastId.should.greaterThan(0);
        done();
      });
    });
  });
}

} // class TestA

module.exports = TestA;
