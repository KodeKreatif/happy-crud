'use strict';

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
    reply(err).statusCode(500);
  });
}

delete(request, reply) {
  const self = this;
  const key = request.payload.key;

  self.model.delete(key).then((result) => {
    reply(result);
  }).catch((err) => {
    reply(err).statusCode(500);
  });
}

list(request, reply) {
  const self = this;
  const args = request.queries;

  self.model.list(args).then((result) => {
    reply(result);
  }).catch((err) => {
    reply(err).statusCode(500);
  });
}



validation() {
  return {
  }
}


} // class BaseController
module.exports = BaseController;
