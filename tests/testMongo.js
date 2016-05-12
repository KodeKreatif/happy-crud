'use strict';
const BaseController = require('../api/base-controller');
const MongoDbModel = require('../api/mongodb-model');
const HappyCrud = require('../api');
const BaseTest = require('./base-test');
const should = require('should');
const mongoose = require('mongoose');
const events = require('events');
const util = require('util');

class ControllerMongo extends BaseController {
} // class ModelB

class TestMongo extends BaseTest {

constructor(server) {
  super(server);
  var self = this;

  const db = 'mongodb://localhost/test';
  const col = 'testb';
  const schema = {
    a: String,
    b: String,
    c: Number,
    d: {},
    e: Date,
  }

  const options = {
    word: 'mongo',
    path: '/api',
    mount: '/',
  }
  const model = new MongoDbModel(db, col, schema);
  const ctrl = new ControllerMongo(model);
  const api = new HappyCrud(server, ctrl, options);

  // clean the collection for new unit testing instance
  model.on('ready', () => {
    mongoose.connection.db.dropCollection(col, () => {
      self.emit('ready');
    });
  })

}

doTest() {
  const self = this;
  var lastId;
  describe('MongoDB : Basic creation', ()=> {
    it('should be able to create a record', (done)=> {
      const request = self.createPostRequest({
        url: 'http://localhost:3030/api/mongos',
        payload: {
          a:'a', b: 'b', c: 1
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.c.should.equal(1);
        mongoose.Types.ObjectId.isValid(r._id).should.equal(true);
        lastId = r._id;
        done();
      });
    });
  }); // describe Basic creation

  describe('MongoDB : Basic read', ()=> {
    it('should be able to read a record', (done)=> {
      const key = lastId;
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongo/${key}`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r._id.should.equal(key);
        r.a.should.equal('a');
        r.b.should.equal('b');
        r.c.should.equal(1);
        done();
      });
    });


  }); // describe Basic read

  describe('MongoDB : Basic update', ()=> {
    it('should be able to update a record', (done)=> {
      const key = lastId;
      const request = self.createPutRequest({
        url: `http://localhost:3030/api/mongo/${key}`,
        payload: {
          b: 'b1',
          c: 2
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.b.should.equal('b1');
        r.c.should.equal(2);
        done();
      });
    });
  }); // describe Basic update

  describe('MongoDB : Basic delete', ()=> {
    it('should be able to delete a record', (done)=> {
      const key = lastId;
      const request = self.createDeleteRequest({
        url: `http://localhost:3030/api/mongos`,
        payload: {
          key: lastId
        }
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        r.success.should.equal(true);
        done();
      });
    });
  }); // describe Basic delete

  describe('MongoDB : Basic list', ()=> {
    it('should be able to list records', (done)=> {
      const request = self.createPostRequest({
        url: 'http://localhost:3030/api/mongos',
        payload: {
          a:'a', b: 'b', c: 1
        }
      });
      self.server.inject(request, (response) => {
        const request = self.createGetRequest({
          url: `http://localhost:3030/api/mongos`,
        });
        self.server.inject(request, (response) => {
          response.statusCode.should.equal(200);
          const r = JSON.parse(response.payload);
          r.totalCount.should.equal(1);
          r.data.length.should.equal(1);
          const postRequest = self.createPostRequest({
            url: 'http://localhost:3030/api/mongos',
            payload: {
              a:'a', b: 'b', c: 1, e : (new Date('2016/01/01')).toISOString()
            }
          });
          const postRequest2 = self.createPostRequest({
            url: 'http://localhost:3030/api/mongos',
            payload: {
              a:'somestring1', b: 'longersomestring', c: 2, e : (new Date('2016/01/02')).toISOString()
            }
          });
          const postRequest3 = self.createPostRequest({
            url: 'http://localhost:3030/api/mongos',
            payload: {
              a:'longersomestring', b: 'uniquestring', c: 3, e : (new Date('2016/01/03')).toISOString()
            }
          });
          const postRequest4 = self.createPostRequest({
            url: 'http://localhost:3030/api/mongos',
            payload: {
              a:'longersomestring', b: 'longersomestring', c: 4, d: { deep : 'object'}
            }
          });
          self.server.inject(postRequest, (response) => {
            self.server.inject(postRequest, (response) => {
              self.server.inject(postRequest, (response) => {
                self.server.inject(postRequest2, (response) => {
                  self.server.inject(postRequest3, (response) => {
                    self.server.inject(postRequest4, (response) => {
                      const requestByPage1Limit2 = self.createGetRequest({
                        url: `http://localhost:3030/api/mongos?page=1&limit=2`,
                      });
                      self.server.inject(requestByPage1Limit2, (response) => {
                        response.statusCode.should.equal(200);
                        const r = JSON.parse(response.payload);
                        r.totalCount.should.equal(7);
                        r.totalPages.should.equal(4);
                        r.data.length.should.equal(2);
                        const requestByPage2Limit3 = self.createGetRequest({
                          url: `http://localhost:3030/api/mongos?page=2&limit=3`,
                        });
                        self.server.inject(requestByPage2Limit3, (response) => {
                          response.statusCode.should.equal(200);
                          const r = JSON.parse(response.payload);
                          r.totalCount.should.equal(7);
                          r.totalPages.should.equal(3);
                          r.data.length.should.equal(3);
                          done();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
    it('should be able to list records with filter', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?a=somestring1`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(1);
        should(r.data[0].a).equal('somestring1');
        done();
      });
    });
    it('should be able to list records with wrong filterKey, return nothing', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?abc=somestring`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(0);
        done();
      });
    });
    it('should be able to list records with wrong filterValue, return nothing', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?a=somestringthatdoesntexist`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(0);
        done();
      });
    });
    it('should be able to list records with search', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?a=search(mestr)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(3);
        should(r.data[0].a.indexOf('mestr')).greaterThan(-1);
        should(r.data[1].a.indexOf('mestr')).greaterThan(-1);
        should(r.data[2].a.indexOf('mestr')).greaterThan(-1);
        done();
      });
    });
    it('should be able to list records with wrong searchKey, return nothing', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?abc=search(somestring)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(0);
        done();
      });
    });
    it('should be able to list records with wrong searchValue, return nothing', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?a=search(somestringthatdoesntexist)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(0);
        done();
      });
    });
    it('should be able to list records with combined search and filter', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?a=somestring1&b=search(estring)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(1);
        should(r.data[0].a).equal('somestring1');
        /* should(r.data[1].b).equal('uniquestring'); */
        done();
      });
    });

    // Query using reserved key : gt, gte, lt, lte
    it('should be able to list records with search()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?a=search(mestr)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(3);
        should(r.data[0].a.indexOf('mestr')).greaterThan(-1);
        should(r.data[1].a.indexOf('mestr')).greaterThan(-1);
        should(r.data[2].a.indexOf('mestr')).greaterThan(-1);
        done();
      });
    });
    it('should be able to list records with gt()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?c=gt(2)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(2);
        should(r.data[0].c).greaterThan(2);
        should(r.data[1].c).greaterThan(2);
        done();
      });
    });
    it('should be able to list records with gte()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?c=gte(2)`,
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
        url: `http://localhost:3030/api/mongos?c=lt(2)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(4);
        should(r.data[0].c).lessThan(2);
        should(r.data[1].c).lessThan(2);
        should(r.data[2].c).lessThan(2);
        should(r.data[3].c).lessThan(2);
        done();
      });
    });
    it('should be able to list records with lte()', (done)=> {
      const request = self.createGetRequest({
        url: `http://localhost:3030/api/mongos?c=lte(2)`,
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
        url: `http://localhost:3030/api/mongos?c=lt(3)&c=gt(1)`,
      });
      self.server.inject(request, (response) => {
        response.statusCode.should.equal(200);
        const r = JSON.parse(response.payload);
        should(r.data.length).equal(1);
        should(r.data[0].c).lessThanOrEqual(3);
        should(r.data[0].c).greaterThanOrEqual(1);
        done();
      });
    });
    it('should be able to list records with lt() and gt() by date value', (done)=> {
      let start = (new Date('2016/01/01')).toISOString();
      let end = (new Date('2016/01/03')).toISOString();
      const request = self.createGetRequest({
        url: 'http://localhost:3030/api/mongos?e=gt(' + start + ')&e=lt(' + end + ')',
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
}

} // class TestMongo

// Add event emitter capabilities to the class
Object.keys(events.EventEmitter.prototype).forEach((prop) => {
  TestMongo.prototype[prop] = events.EventEmitter.prototype[prop];
})
events.EventEmitter.call(TestMongo);

module.exports = TestMongo;
