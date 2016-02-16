'use strict';

const GroupFilter = function(server, options, next) {
  this.server = server;
  this.options = options || {};

}


exports.register = function(server, options, next) {
  new GroupFilter(server, options, next);
  next();
};

exports.register.attributes = {
  pkg: require("../package.json")
};


