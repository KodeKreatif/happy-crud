'use strict';

const BaseController = require('./api/base-controller');
const Sqlite3Model = require('./api/sqlite3-model');
const HappyCrud = require('./api');


class Controller extends BaseController {}

class Abstract {

  constructor(server, options) {
    const db = options.db;
    const schema = options.schema;
    const table = options.table || options.collection;
    let model;
    if (options.dbType === 'sqlite3') {
      model = new Sqlite3Model(db, table, schema);
    } else if (options.dbType === 'mongodb') {
      model = new MongoDbModel(db, table, schema);
    }
    const ctrl = new Controller(model);
    const api = new HappyCrud(server, ctrl, options);
  }
} // class Abstract

module.exports = Abstract;


