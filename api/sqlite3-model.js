'use strict';

const BaseModel = require('../api/base-model');
class Sqlite3Model extends BaseModel {

constructor(db, table, schema) {
  super(db, table, schema);
  this.impl.create = this.sqliteCreate;
  this.impl.read = this.sqliteRead;
  this.impl.update = this.sqliteUpdate;
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

sqliteRead(key, filter) {
  const self = this;
  return new Promise((resolve, reject) => {
    let keyField;
    for (let fieldName of (Object.keys(self.schema))) {
      const fieldRecord = self.schema[fieldName];
      if (fieldRecord && fieldRecord.primaryKey) {
        keyField = fieldName;
        break;
      }
    }

    let fields = '*';
    if (filter && Array.isArray(filter)) {
      fields = filter.join(',');
    }

    let sql = `select ${fields} from ${self.table} where ${keyField} = ?`;
    self.db.get(sql, [key], function(err, result) {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

sqliteUpdate(key, data) {
  const self = this;
  return new Promise((resolve, reject) => {
    let keyField;
    let fields = [];
    let values = [];
    let marks = [];
    for (let fieldName of (Object.keys(self.schema))) {
      const fieldRecord = self.schema[fieldName];
      if (fieldRecord && fieldRecord.primaryKey) {
        keyField = fieldName;
        break;
      }
    }

    for (let f of Object.keys(self.schema)) {
      if (f !== keyField && data[f]) {
        fields.push(f);
        values.push(data[f]);
        marks.push('?');
      }
    }
    let sql = `replace into ${self.table} `;
        sql += '(' + fields.join(',') + ')';
        sql += ' values ';
        sql += '(' + marks.join(',') + ')';

    self.db.run(sql, values, function(err, result) {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        changes: this.changes
      });
    });
  });
}


} // class Sqlite3Model
module.exports = Sqlite3Model;
