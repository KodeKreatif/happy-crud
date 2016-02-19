'use strict';
const server = require("./server");

const TestA = require('./testA');
const testA = new TestA(server);
testA.test();

const TestMongo = require('./testMongo');
const testMongo = new TestMongo(server);
testMongo.on('ready', function(){
  testMongo.test();
})
