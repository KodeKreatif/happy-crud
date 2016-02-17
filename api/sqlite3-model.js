'use strict';

const BaseModel = require('../api/base-model');
class Sqlite3Model extends BaseModel {

constructor(db, table, schema) {
  super(db, table, schema);
  this.impl.create = this.sqliteCreate;
}

sqliteCreate(data) {
  const self = this;
  return new Promise((resolve, reject) => {
    let fields = [];
    let values = [];
    let marks = [];

    for (let f of Object.keys(self.schema)) {
      if (data[f]) {
        fields.push(f);
        values.push(data[f]);
        marks.push('?');
      }
    }
    let sql = `insert into ${self.table} `;
        sql += '(' + fields.join(',') + ')';
        sql += ' values ';
        sql += '(' + marks.join(',') + ')';

    self.db.run(sql, values, function(err, result) {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        lastId: this.lastID,
        changes: this.changes
      });
    });
  });
}


} // class Sqlite3Model
module.exports = Sqlite3Model;
