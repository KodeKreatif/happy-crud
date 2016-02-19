'use strict';
const server = require("./server");

const TestA = require('./testA');
const testA = new TestA(server);
testA.test();

const TestB = require('./testB');
const testB = new TestB(server);
testB.test();
