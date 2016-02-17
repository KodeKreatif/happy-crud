'use strict';
const server = require("./server");

const TestA = require('./testA');
const testA = new TestA(server);
testA.test();
