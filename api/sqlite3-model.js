'use strict';

const BaseModel = require('../api/base-model');
const events = require('events');
const process = require('process');
class Sqlite3Model extends BaseModel {

constructor(db, table, schema) {
  super(db, table, schema);
  this.impl.create = this.sqliteCreate;
  this.impl.read = this.sqliteRead;
  this.impl.update = this.sqliteUpdate;
  this.impl.delete = this.sqliteDelete;
  this.impl.list = this.sqliteList;
  const self = this;
  process.nextTick(() => {
    self.emit('ready');
  });
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

sqliteDelete(key) {
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

    let sql = `delete from ${self.table} where ${keyField} = ?`;
    self.db.run(sql, [key], function(err, result) {
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

sqliteList(params) {
  const self = this;
  return new Promise((resolve, reject) => {
    const fields = '*';
    if (params && Array.isArray(params.fields)) {
      fields = params.fields.join(',');
    }
    let filterArgs = '';
    let args = '';

    let sqlCount = `select count(1) from ${self.table} ${filterArgs}`;
    self.db.get(sqlCount, [], function(err, count) {
      if (err) {
        reject(err);
        return;
      }
      let sqlAll = `select ${fields} from ${self.table} ${args}`;
      self.db.all(sqlAll, [], function(err, results) {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          data: results,
          totalCount: count['count(1)']
        });
      });

    });
  });
}

} // class Sqlite3Model

// Add event emitter capabilities to the class
Object.keys(events.EventEmitter.prototype).forEach((prop) => {
  Sqlite3Model.prototype[prop] = events.EventEmitter.prototype[prop];
})
events.EventEmitter.call(Sqlite3Model);

module.exports = Sqlite3Model;
