'use strict';
const pluralize = require('pluralize');

class CrudApi {

constructor(server, options, next) {
  this.server = server;
  this.options = options || {};
}

setController(controller) {
  this.controller = controller;
}

install(options) {
  const self = this;
  //
  // options:
  /*

     options: {
      path: '/api',
      word: 'word' || ['word', 'words'],
      authentications: {
        'create': <name>,
        'read': <name>,
        'update': <name>,
        'delete': <name>,
        'list': <name>,
      }
     }

   */

  if (!options.word) {
    throw Error('options.word is not defined');
  }
  if (!options.path) {
    throw Error('options.path is not defined');
  }

  // Validate and safety checks of options
  // # pluralize
  // If options.word is a single word, make the plural version of it
  if (typeof options.word === 'string') {
    options.word = [ options.word, pluralize(options.word)];
  }

  // # authentications
  if (!options.authentications) {
    options.authentications = {};
  }

  self.installCreate(options);
  /*
  installRead(options);
  installUpdate(options);
  installDelete(options);
  installList(options);
  */
}

installCreate(options) {
  const self = this;
  var config =
  {
    method: 'POST',
    path: `${options.path}/${options.word[1]}`,
    handler: function handleCreate(request, reply) {
      return self.controller.create(request, reply);
    },
    config: {
      auth: options.authentications.create || null,
    }
  };
  if (self.controller.validation().create) {
    config.config.validate = config.config.validate || {};
    config.config.validate.payload = self.controller.validation().create;
  }
  self.server.route(config);
}

} // Class

exports.register = function(server, options, next) {
  if (!global.CrudApi) {
    global.CrudApi = new CrudApi(server, options, next);
  }
  next();
};

exports.register.attributes = {
  pkg: require("../package.json")
};


