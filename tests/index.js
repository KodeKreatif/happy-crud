'use strict';
const server = require("./server");


describe('mongo', function() {
  const TestMongo = require('./testMongo');
  const testMongo = new TestMongo(server);
  before(function(done) {
    testMongo.once('ready', function() {
      done();
    });
  });
  testMongo.doTest();
});

describe('sqlite', function() {
  const TestSqlite3 = require('./testSqlite3');
  const testSqlite3 = new TestSqlite3(server);
  testSqlite3.doTest();
});


