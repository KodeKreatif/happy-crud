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
  const data = request.payload;

  self.model.create(data).then((result) => {
    reply(result);
  }).catch((err) => {
    log('Controller::create', err);
    reply(err).statusCode(500);
  });
}

read(request, reply) {
  const self = this;
  const key = request.params.key;
  const fields = request.params.fields;

  self.model.read(key, fields).then((result) => {
    reply(result);
  }).catch((err) => {
    log('Controller::read', err);
    reply(err).statusCode(500);
  });
}

update(request, reply) {
  const self = this;
  const key = request.params.key;
  const data = request.payload;

  self.model.update(key, data).then((result) => {
    reply(result);
  }).catch((err) => {
    log('Controller::update', err);
    reply(err).statusCode(500);
  });
}

delete(request, reply) {
  const self = this;
  if (typeof request.payload === 'string') {
    request.payload = JSON.parse(request.payload);
  }
  const key = request.payload.key;
  self.model.delete(key).then((result) => {
    reply(result);
  }).catch((err) => {
    log('Controller::delete', err);
    reply(err).statusCode(500);
  });
}

list(request, reply) {
  const self = this;
  const args = request.query;

  self.model.list(args).then((result) => {
    reply(result);
  }).catch((err) => {
    log('Controller::list', err);
    reply(err).statusCode(500);
  });
}



validation() {
  return {
  }
}


} // class BaseController
module.exports = BaseController;
