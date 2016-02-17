'use strict';

class BaseModel {
constructor(db, table, schema) {
  this.db = db;
  this.table = table;
  this.schema = schema;
  this.impl = {
  }
}

create() {
  if (this.impl.create) {
    return this.impl.create.apply(this, arguments);
  } else {
    throw Error('Implementation not exists');
  }
}

} // class BaseModel

module.exports = BaseModel;
