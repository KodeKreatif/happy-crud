'use strict';
const BaseController = require('../api/base-controller');
const Sqlite3Model = require('../api/sqlite3-model');
const HappyCrud = require('../api');
const BaseTest = require('./base-test');
const should = require('should');
const Sqlite3 = require('sqlite3');

class ControllerA extends BaseController {
} // class ModelA

class TestSqlite3 extends BaseTest {

setupDb() {
  const db = new Sqlite3.Database(':memory:');
  db.serialize(function() {
    db.run("CREATE TABLE testa (id INTEGER PRIMARY KEY AUTOINCREMENT, a TEXT, b TEXT, c INTEGER)");
  });
  return db;
}

constructor(server) {
  super(server);
  const schema = {
    id: {
      type: Number,
      primaryKey: true,
      autoIncrement: true
    },
    a: String,
    b: String,
    c: Number,
  }

  const options = {
    word: 'user',
    path: '/api',
    mount: '/',
  }

  const db = this.setupDb();
  const table = 'testa';
  const model = new Sqlite3Model(db, table, schema);
  const ctrl = new ControllerA(model);
  const api = new HappyCrud(server, ctrl, options);

}

doTest() {
  const self = this;
  describe('Basic creation', ()=> {
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
        r.lastId.should.equal(1);
        done();
      });
    });

    it('should be able to create another record with correct lastId', (done)=> {
      const request = self.createPostRequest({
        url: 'http://localhost:3030/api/users',
        payload: {
          a:'a', b: 'b', c: 1
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.lastId.should.equal(2);
        done();
      });
    });

  }); // describe Basic creation

  describe('Basic read', ()=> {
    it('should be able to read a record', (done)=> {
      const key = 1;
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/user/${key}`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.id.should.equal(1);
        r.a.should.equal('a');
        r.b.should.equal('b');
        r.c.should.equal(1);
        done();
      });
    });


  }); // describe Basic read

  describe('Basic update', ()=> {
    it('should be able to update a record', (done)=> {
      const key = 1;
      const request = self.createPutRequest({
        url: `http://localhost:3030/api/user/${key}`,
        payload: {
          b: 'b1',
          c: 2
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.changes.should.equal(1);
        done();
      });
    });
  }); // describe Basic update

  describe('Basic delete', ()=> {
    it('should be able to delete a record', (done)=> {
      const key = 1;
      const request = self.createDeleteRequest({
        url: `http://localhost:3030/api/users`,
        payload: {
          key: 2
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.changes.should.equal(1);
        done();
      });
    });
  }); // describe Basic delete

  describe('Basic list', ()=> {
    it('should be able to list records', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.totalCount.should.equal(2);
        r.data.length.should.equal(2);
        done();
      });
    });
  }); // describe Basic delete


}


} // class TestSqlite3

module.exports = TestSqlite3;
