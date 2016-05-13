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
    db.run("CREATE TABLE testa (id INTEGER PRIMARY KEY AUTOINCREMENT, a TEXT, b TEXT, c INTEGER, e DATE)");
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
    e: Date,
  }

  const options = {
    word: 'user',
    path: '/api',
    mount: '/',
    beforeFunc : {
      create : function(request, reply) {
        return new Promise((resolve, reject) => {
          if (request.query.c) {
            request.payload.c = request.query.c;
          }
          resolve()
        })
      },
      update : function(request, reply) {
        return new Promise((resolve, reject) => {
          if (request.query.c) {
            request.payload.c = request.query.c;
          }
          resolve()
        })
      },
      read : function(request, reply) {
        return new Promise((resolve, reject) => {
          if (request.query.key) {
            request.params.key = request.query.key;
          }
          resolve()
        })
      },
      delete : function(request, reply) {
        return new Promise((resolve, reject) => {
          if (request.query.key) {
            request.payload.key = request.query.key;
          }
          resolve()
        })
      },
      list : function(request, reply) {
        return new Promise((resolve, reject) => {
          if (request.query.realPage) {
            request.query.page = request.query.realPage;
          }
          resolve()
        })
      }
    },
    afterFunc : {
      create : function(request, reply, result) {
        return new Promise((resolve, reject) => {
          result.someKey = 'someString';
          resolve()
        })
      },
      update : function(request, reply, result) {
        return new Promise((resolve, reject) => {
          result.someKey = 'someString';
          resolve()
        })
      },
      read : function(request, reply, result) {
        return new Promise((resolve, reject) => {
          result.someKey = 'someString';
          resolve()
        })
      },
      delete : function(request, reply, result) {
        return new Promise((resolve, reject) => {
          result.someKey = 'someString';
          resolve()
        })
      },
      list : function(request, reply, result) {
        return new Promise((resolve, reject) => {
          result.someKey = 'someString';
          resolve()
        })
      },
    }
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
            a:'a', b: 'longersomestring', c: 1, e: (new Date('2016/01/01')).toISOString()
          }
        });
        const postRequest2 = self.createPostRequest({
          url: 'http://localhost:3030/api/users',
          payload: {
            a:'somestring', b: 'longersomestring', c: 2, e: (new Date('2016/01/02')).toISOString()
          }
        });
        const postRequest3 = self.createPostRequest({
          url: 'http://localhost:3030/api/users',
          payload: {
            a:'longersomestring', b: 'longersomestring', c: 3, e: (new Date('2016/01/03')).toISOString()
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
        url: `http://localhost:3030/api/users?a=somestring`,
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
        url: `http://localhost:3030/api/users?a=search(some)`,
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
        url: `http://localhost:3030/api/users?a=search(longe)&b=longersomestring`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload)
        should(r.data.length).equal(1);
        should(r.data[0].id).equal(7);
        should(r.data[0].a).equal('longersomestring');
        should(r.data[0].b).equal('longersomestring');
        should(r.data[0].c).equal(3);
        done();
      });
    });
    // Query using reserved words
    it('should be able to list records with search()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?a=search(mestr)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(2);
        should(r.data[0].a.indexOf('mestr')).greaterThan(-1);
        should(r.data[1].a.indexOf('mestr')).greaterThan(-1);
        done();
      });
    });
    it('should be able to list records with gt()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?c=gt(2)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(1);
        should(r.data[0].c).greaterThan(2);
        done();
      });
    });
    it('should be able to list records with gte()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?c=gte(2)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(3);
        should(r.data[0].c).greaterThanOrEqual(2);
        should(r.data[1].c).greaterThanOrEqual(2);
        should(r.data[2].c).greaterThanOrEqual(2);
        done();
      });
    });
    it('should be able to list records with lt()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?c=lt(2)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(3);
        should(r.data[0].c).lessThan(2);
        should(r.data[1].c).lessThan(2);
        should(r.data[2].c).lessThan(2);
        done();
      });
    });
    it('should be able to list records with lte()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?c=lte(2)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(5);
        should(r.data[0].c).lessThanOrEqual(2);
        should(r.data[1].c).lessThanOrEqual(2);
        should(r.data[2].c).lessThanOrEqual(2);
        should(r.data[3].c).lessThanOrEqual(2);
        should(r.data[4].c).lessThanOrEqual(2);
        done();
      });
    });
    it('should be able to list records with lt() and gt()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?c=lt(3)&c=gt(1)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(2);
        should(r.data[0].c).lessThanOrEqual(3);
        should(r.data[0].c).greaterThanOrEqual(1);
        should(r.data[1].c).lessThanOrEqual(3);
        should(r.data[1].c).greaterThanOrEqual(1);
        done();
      });
    });
    it('should be able to list records with lt() and gt() by date value', (done)=> {
      let start = (new Date('2016/01/01')).toISOString();
      let end = (new Date('2016/01/03')).toISOString();
      const request = self.createGetRequest({
        url: 'http://localhost:3030/api/users?e=gt(' + start + ')&e=lt(' + end + ')',
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(1);
        should((new Date(r.data[0].e)).valueOf()).greaterThan((new Date(start)).valueOf());
        should((new Date(r.data[0].e)).valueOf()).lessThan((new Date(end)).valueOf());
        done();
      });
    });
  }); // describe Basic list
  
  describe('Before and After function', ()=> {
    it('should be able to create a record that carried manipulated data from before and after function', (done)=> {
      const request = self.createPostRequest({
        // Manipulate c value
        url: 'http://localhost:3030/api/users?c=9',
        payload: {
          a:'a', b: 'b', c: 1
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        // This someKey has been added on after function
        r.someKey.should.equal('someString');
        r.lastId.should.equal(8);
        const key = r.lastId;
        const request = self.createGetRequest({
          url: `http://localhost:3030/api/user/${key}`,
        });
        self.server.inject(request, (response) => {
          response.statusCode.should.equal(200);
          const r = JSON.parse(response.payload);
          r.id.should.equal(8);
          r.a.should.equal('a');
          r.b.should.equal('b');
          // This c value has been manipulated to 9
          r.c.should.equal(9);
          done();
        });
      });
    });
    it('should be able to update a record that carried manipulated data from before and after function', (done)=> {
      const key = 8;
      const request = self.createPutRequest({
        url: `http://localhost:3030/api/user/${key}?c=10`,
        payload: {
          b: 'b1',
          c: 2
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        // This someKey has been added on after function
        r.someKey.should.equal('someString');
        const request = self.createGetRequest({
          url: `http://localhost:3030/api/user/${key}`,
        });
        self.server.inject(request, (response) => {
          response.statusCode.should.equal(200);
          const r = JSON.parse(response.payload);
          r.id.should.equal(8);
          r.b.should.equal('b1');
          // This c value has been manipulated to 10
          r.c.should.equal(10);
          r.someKey.should.equal('someString');
          done();
        });
      });
    });
    it('should be able to read a record that carried manipulated data from before and after function', (done)=> {
      const key = 1;
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/user/${key}?key=8`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.id.should.equal(8);
        r.b.should.equal('b1');
        r.c.should.equal(10);
        r.someKey.should.equal('someString');
        done();
      });
    });
    it('should be able to delete a record that carried manipulated data from before function', (done)=> {

      const request = self.createDeleteRequest({
        url: `http://localhost:3030/api/users?key=8`,
        payload: {
          key: 2
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.changes.should.equal(1);
        r.someKey.should.equal('someString');
        const key = 8;
        const request = self.createGetRequest({
          url: `http://localhost:3030/api/user/${key}`,
        });
        self.server.inject(request, (response) => {
          response.statusCode.should.equal(200);
          const r = JSON.parse(response.payload);
          r.message.should.equal('Not found');
          done();
        });
      });
    });
    it('should be able to list records that carried manipulated data from before function', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/users?page=1&limit=2&realPage=2`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.someKey.should.equal('someString');
        should(r.totalPages).equal(3);
        should(r.totalCount).equal(6);
        should(r.page).equal(2);
        should(r.limit).equal(2);
        should(r.data.length).equal(2);
        done();
      });

    });
  }); // describe Before and After function
}


} // class TestSqlite3

module.exports = TestSqlite3;
