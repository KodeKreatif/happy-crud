'use strict';
const server = require("./server");

const TestA = require('./testA');
const testA = new TestA(server);
testA.test();

const TestMongo = require('./testMongo');
new TestMongo(server).then((testMongo) => {
  testMongo.test();
});
