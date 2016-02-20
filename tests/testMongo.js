'use strict';
const BaseController = require('../api/base-controller');
const MongoDbModel = require('../api/mongodb-model');
const HappyCrud = require('../api');
const BaseTest = require('./base-test');
const should = require('should');
const mongoose = require('mongoose');

class ControllerB extends BaseController {
} // class ModelA

class TestB extends BaseTest {

constructor(server) {
  super(server);

  const schema = {
    a: String,
    b: String,
    c: Number,
  }

  const options = {
    word: 'b',
    path: '/api',
    mount: '/',
  }

  const col = 'testb';
  const model = new MongoDbModel(col, schema);
  const ctrl = new ControllerB(model);
  const api = new HappyCrud(server, ctrl, options);

  // Setup db and return instance in promise
  return new Promise((resolve) => {
    mongoose.connect('mongodb://localhost/test');
    mongoose.connection.once('open', () => {
      mongoose.connection.db.dropCollection('testb', () => {
        resolve(this);
      });
    })
  })
}

doTest() {
  const self = this;
  var lastId;
  describe('MongoDB : Basic creation', ()=> {
    it('should be able to create a record', (done)=> {
      const request = self.createPostRequest({
        url: 'http://localhost:3030/api/bs',
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
        url: `http://localhost:3030/api/b/${key}`,
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
        url: `http://localhost:3030/api/b/${key}`,
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
        url: `http://localhost:3030/api/bs`,
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
        url: 'http://localhost:3030/api/bs',
        payload: {
          a:'a', b: 'b', c: 1
        }
      });
      self.server.inject(request, (response) => {
        const request = self.createGetRequest({
          url: `http://localhost:3030/api/bs`,
        });
        self.server.inject(request, (response) => {
          response.statusCode.should.equal(200);
          const r = JSON.parse(response.payload);
          r.totalCount.should.equal(1);
          r.data.length.should.equal(1);
          done();
        });
      });
    });
  }); // describe Basic delete


}


} // class TestB

module.exports = TestB;
