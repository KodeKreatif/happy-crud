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
        r.totalCount.should.equal(1);
        r.data.length.should.equal(1);
        const postRequest = self.createPostRequest({
          url: 'http://localhost:3030/api/users',
          payload: {
            a:'a', b: 'longersomestring', c: 1
          }
        });
        const postRequest2 = self.createPostRequest({
          url: 'http://localhost:3030/api/users',
          payload: {
            a:'somestring', b: 'longersomestring', c: 2
          }
        });
        const postRequest3 = self.createPostRequest({
          url: 'http://localhost:3030/api/users',
          payload: {
            a:'longersomestring', b: 'longersomestring', c: 2
          }
        });
        self.server.inject(postRequest, (response) => {
          self.server.inject(postRequest, (response) => {
            self.server.inject(postRequest, (response) => {
              self.server.inject(postRequest2, (response) => {
                self.server.inject(postRequest3, (response) => {
                  const requestByPage1Limit2 = self.createGetRequest({
                    url: `http://localhost:3030/api/users?page=1&limit=2`,
                  });
                  self.server.inject(requestByPage1Limit2, (response) => {
                    response.statusCode.should.equal(200);
                    const r = JSON.parse(response.payload);
                    r.totalCount.should.equal(6);
                    r.totalPages.should.equal(3);
                    r.data.length.should.equal(2);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
    it('should be able to list records by page 2', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?page=2&limit=2`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.totalPages).equal(3);
        should(r.totalCount).equal(6);
        should(r.page).equal(2);
        should(r.limit).equal(2);
        should(r.data.length).equal(2);
        done();
      });
    });
    it('should be able to list records (empty result) by unexisting page 4', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?page=4&limit=2`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.totalPages).equal(3);
        should(r.totalCount).equal(6);
        should(r.page).equal(4);
        should(r.limit).equal(2);
        should(r.data.length).equal(0);
        done();
      });
    });
    it('should be able to list records with desc sorting', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?sortBy=id&sort=desc`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload)
        should(r.data[0].id).equal(7);
        done();
      });
    });
    it('should be able to list records with asc sorting', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?sortBy=id&sort=asc`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload)
        should(r.data[0].id).equal(1);
        done();
      });
    });
    it('should be able to list records with filter', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?filterKey=a&filterValue=somestring`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload)
        should(r.data.length).equal(1);
        should(r.data[0].a).equal('somestring');
        should(r.data[0].id).equal(6);
        done();
      });
    });
    it('should be able to list records with search', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?searchKey=a&searchValue=some`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload)
        should(r.data.length).equal(2);
        should(r.data[0].a).equal('longersomestring');
        should(r.data[1].a).equal('somestring');
        should(r.data[0].id).equal(7);
        should(r.data[1].id).equal(6);
        done();
      });
    });
    it('should be able to list records with search within multiple keys', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?searchKey=a,b&searchValue=longersome`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload)
        should(r.data.length).equal(5);
        should(r.data[0].id).equal(7);
        should(r.data[0].a).equal('longersomestring');
        should(r.data[0].b).equal('longersomestring');
        should(r.data[0].c).equal(2);
        should(r.data[1].id).equal(6);
        should(r.data[1].a).equal('somestring');
        should(r.data[1].b).equal('longersomestring');
        should(r.data[1].c).equal(2);
        should(r.data[2].id).equal(5);
        should(r.data[2].a).equal('a');
        should(r.data[2].b).equal('longersomestring');
        should(r.data[2].c).equal(1);
        should(r.data[3].id).equal(4);
        should(r.data[3].a).equal('a');
        should(r.data[3].b).equal('longersomestring');
        should(r.data[3].c).equal(1);
        should(r.data[4].id).equal(3);
        should(r.data[4].a).equal('a');
        should(r.data[4].b).equal('longersomestring');
        should(r.data[4].c).equal(1);

        done();
      });
    });
    it('should be able to list records with combined search and filter', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?searchKey=a&searchValue=longe&filterKey=a&filterValue=somestring`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload)
        should(r.data.length).equal(2);
        should(r.data[0].id).equal(7);
        should(r.data[0].a).equal('longersomestring');
        should(r.data[0].b).equal('longersomestring');
        should(r.data[0].c).equal(2);
        should(r.data[1].id).equal(6);
        should(r.data[1].a).equal('somestring');
        should(r.data[1].b).equal('longersomestring');
        should(r.data[1].c).equal(2);
        done();
      });
    });
  }); // describe Basic delete
}


} // class TestSqlite3

module.exports = TestSqlite3;
