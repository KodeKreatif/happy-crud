'use strict';
const fs = require("fs");

const populate = function(server) {
  const sources = [];
  const dir = __dirname + "/../api";
  const settings = {};
  if (fs.existsSync(dir + "/settings.json")) {
    settings = require(dir + "/settings.json");
  }
  const options = settings.options || {};
  if (fs.existsSync(dir + "/../package.json")) {
    const pkg = require(dir + "/../package.json");

    const routeSettings = {};
    if (settings.prefix) {
      routeSettings.prefix = settings.prefix;
    }
    server.register({
      register: require(dir + "/index.js"),
      options: options
    }, {
      select: ["api"],
      routes: routeSettings
    }, function(err) {
      if (err) {
        console.log("Error registering sources " + dir, err);
      }
    }
    );
  }
}

exports.populate = populate;
