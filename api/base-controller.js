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

validation() {
  return {
  }
}


} // class BaseController
module.exports = BaseController;
