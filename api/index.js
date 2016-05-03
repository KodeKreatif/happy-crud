'use strict';
const pluralize = require('pluralize');

class HappyCrud {

constructor(server, controller, options) {
  this.server = server;
  this.options = options;
  this.attributes = require('../package.json');
  this.register = function() {};

  let prefix = {};
  if (options.mount) {
    prefix = {
      prefix: options.mount
    }
  }
  server.register({
    register: this
  }, {
    select: ['api'],
    routes: prefix
  })
  this.controller = controller;
  this.install(options);
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

  // # beforeFunc
  if (!options.beforeFunc) {
    options.beforeFunc = {};
  }
  if (!options.beforeFunc.create) {
    options.beforeFunc.create = function(request, reply) {
      return new Promise((resolve, reject) => {
        resolve();
      })
    }
  }
  if (!options.beforeFunc.read) {
    options.beforeFunc.read = function(request, reply) {
      return new Promise((resolve, reject) => {
        resolve();
      })
    }
  }
  if (!options.beforeFunc.update) {
    options.beforeFunc.update = function(request, reply) {
      return new Promise((resolve, reject) => {
        resolve();
      })
    }
  }
  if (!options.beforeFunc.delete) {
    options.beforeFunc.delete = function(request, reply) {
      return new Promise((resolve, reject) => {
        resolve();
      })
    }
  }
  if (!options.beforeFunc.list) {
    options.beforeFunc.list = function(request, reply) {
      return new Promise((resolve, reject) => {
        resolve();
      })
    }
  }
  
  // # afterFunc
  if (!options.afterFunc) {
    options.afterFunc = {};
  }
  console.log(options);
  if (!options.afterFunc.create) {
    options.afterFunc.create = function(request, reply, result) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }
  if (!options.afterFunc.read) {
    options.afterFunc.read = function(request, reply, result) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }
  if (!options.afterFunc.update) {
    options.afterFunc.update = function(request, reply, result) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }
  if (!options.afterFunc.delete) {
    options.afterFunc.delete = function(request, reply, result) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }
  if (!options.afterFunc.list) {
    options.afterFunc.list = function(request, reply, result) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }
  
  self.installCreate(options);
  self.installRead(options);
  self.installUpdate(options);
  self.installDelete(options);
  self.installList(options);
}

installCreate(options) {
  const self = this;
  var config =
  {
    method: 'POST',
    path: `${options.path}/${options.word[1]}`,
    handler: function handleCreate(request, reply) {
      request.beforeFunc = options.beforeFunc;
      request.afterFunc = options.afterFunc;
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

installRead(options) {
  const self = this;
  var config =
  {
    method: 'GET',
    path: `${options.path}/${options.word[0]}/{key}`,
    handler: function handleRead(request, reply) {
      request.beforeFunc = options.beforeFunc;
      request.afterFunc = options.afterFunc;
      return self.controller.read(request, reply);
    },
    config: {
      auth: options.authentications.read || null,
    }
  };
  if (self.controller.validation().read) {
    config.config.validate = config.config.validate || {};
    config.config.validate.params = self.controller.validation().read;
  }
  self.server.route(config);
}

installUpdate(options) {
  const self = this;
  var config =
  {
    method: 'PUT',
    path: `${options.path}/${options.word[0]}/{key}`,
    handler: function handleUpdate(request, reply) {
      request.beforeFunc = options.beforeFunc;
      request.afterFunc = options.afterFunc;
      return self.controller.update(request, reply);
    },
    config: {
      auth: options.authentications.update|| null,
    }
  };
  if (self.controller.validation().update) {
    config.config.validate = config.config.validate || {};
    config.config.validate.params = self.controller.validation().update;
  }
  self.server.route(config);
}

installDelete(options) {
  const self = this;
  var config =
  {
    method: 'DELETE',
    path: `${options.path}/${options.word[1]}`,
    handler: function handleDelete(request, reply) {
      request.beforeFunc = options.beforeFunc;
      request.afterFunc = options.afterFunc;
      return self.controller.delete(request, reply);
    },
    config: {
      auth: options.authentications.delete|| null,
    }
  };
  if (self.controller.validation().update) {
    config.config.validate = config.config.validate || {};
    config.config.validate.params = self.controller.validation().delete;
  }
  self.server.route(config);
}

installList(options) {
  const self = this;
  var config =
  {
    method: 'GET',
    path: `${options.path}/${options.word[1]}`,
    handler: function handleList(request, reply) {
      request.beforeFunc = options.beforeFunc;
      request.afterFunc = options.afterFunc;
      return self.controller.list(request, reply);
    },
    config: {
      auth: options.authentications.list|| null,
    }
  };
  if (self.controller.validation().list) {
    config.config.validate = config.config.validate || {};
    config.config.validate.params = self.controller.validation().list;
  }
  self.server.route(config);
}






} // Class


module.exports = HappyCrud;


