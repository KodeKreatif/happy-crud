'use strict';
const process = require('process');
const isProduction = (process.env.NODE_ENV === 'production');

const log = function(origin, err) {
  if (!isProduction) {
    console.log(`ERROR: ${origin}`);
    if (err.stack) {
      console.log(err.stack);
    } else {
      console.log(err);
    }
  }
}

class BaseController {

constructor(model) {
  this.model = model;
}

create(request, reply) {
  const self = this;

  async function req() {
    try {
      let res = await request.beforeFunc.create(request, reply);
      const data = request.payload;
      res = await self.model.create(data);
      res = await request.afterFunc.create(request, reply, res) || res;
      reply(res);
    } catch (err) {
      console.log(err);
      reply({message: err.message}).statusCode(500);
    }
  }
  req();
}

read(request, reply) {
  const self = this;

  async function req() {
    try {
      let res = await request.beforeFunc.read(request, reply);
      const key = request.params.key;
      const fields = request.params.fields;
      res = await self.model.read(key, fields);
      res = await request.afterFunc.read(request, reply, res) || res;
      reply(res);
    } catch (err) {
      console.log(err);
      reply({message: err.message}).statusCode(500);
    }
  }
  req();
}

update(request, reply) {
  const self = this;

  async function req() {
    try {
      let res = await request.beforeFunc.update(request, reply);
      const key = request.params.key;
      const data = request.payload;
      res = await self.model.update(key, data);
      res = await request.afterFunc.update(request, reply, res) || res;
      reply(res);
    } catch (err) {
      console.log(err);
      reply({message: err.message}).statusCode(500);
    }
  }
  req();
}

delete(request, reply) {
  const self = this;
  if (typeof request.payload === 'string') {
    request.payload = JSON.parse(request.payload);
  }

  async function req() {
    try {
      let res = await request.beforeFunc.delete(request, reply);
      const key = request.payload.key;
      res = await self.model.delete(key);
      res = await request.afterFunc.delete(request, reply, res) || res;
      reply(res);
    } catch (err) {
      console.log(err);
      reply({message: err.message}).statusCode(500);
    }
  }
  req();
}

list(request, reply) {
  const self = this;
  async function req() {
    try {
      let res = await request.beforeFunc.list(request, reply);
      const args = request.query;
      res = await self.model.list(args);
      res = await request.afterFunc.list(request, reply, res) || res;
      reply(res);
    } catch (err) {
      console.log(err);
      reply({message: err.message}).statusCode(500);
    }
  }
  req();
}

validation() {
  return {
  }
}


} // class BaseController
module.exports = BaseController;
