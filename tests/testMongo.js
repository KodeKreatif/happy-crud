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
              a:'a', b: 'b', c: 1
            }
          });
          self.server.inject(postRequest, (response) => {
            self.server.inject(postRequest, (response) => {
              self.server.inject(postRequest, (response) => {
                self.server.inject(postRequest, (response) => {
                  self.server.inject(postRequest, (response) => {
                    self.server.inject(postRequest, (response) => {
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
  }); // describe Basic delete
}

} // class TestMongo

// Add event emitter capabilities to the class
Object.keys(events.EventEmitter.prototype).forEach((prop) => {
  TestMongo.prototype[prop] = events.EventEmitter.prototype[prop];
})
events.EventEmitter.call(TestMongo);

module.exports = TestMongo;
