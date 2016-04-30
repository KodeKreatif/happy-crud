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
    if (!data) {
      return reject(new Error('Payload should not be empty'));
    }
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
        console.log(err);
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
        console.log(err);
        reject(err);
        return;
      }
      if (!result) {
        reject(new Error('Not found'));
      }
      resolve(result);
    });
  });
}

sqliteUpdate(key, data) {
  const self = this;
  return new Promise((resolve, reject) => {
    let keyField;
    let fields = ['id'];
    let values = [key];
    let marks = ['?'];
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
        console.log(err);
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
        console.log(err);
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
    if ((params.filterKey && params.filterValue) || (params.searchKey && params.searchValue)) {
      filterArgs += 'where'
      if (params.filterKey && params.filterValue) {
        filterArgs += ' ' + params.filterKey + ' = \'' + params.filterValue + '\'';
      }
      
      if (params.searchKey && params.searchValue) {
        if (filterArgs != 'where') {
          filterArgs += ' or';
        }
        if (params.searchKey.indexOf(',') > -1) {
          let keys = params.searchKey.split(',');
          filterArgs += ' ( ';
          for (var i in keys) {
            if (i > 0) {
              filterArgs += ' or ';
            }
            filterArgs += keys[i] + ' like \'%' + params.searchValue + '%\'';
          }
          filterArgs += ' ) ';
        } else {
          filterArgs += ' ' + params.searchKey + ' like \'%' + params.searchValue + '%\'';
        }
      }
    }
    let page = parseInt(params.page || 1);
    let limit = parseInt(params.limit || 10);
    let sortby = params.sortby || 'id';
    let sort = params.sort || 'desc'
    let skip = (page - 1) * limit;
    let args =  ' order by ' + sortby + ' ' + sort + ' limit ' + skip + ',' + limit;
    let sqlCount = `select count(1) from ${self.table} ${filterArgs}`;
    self.db.get(sqlCount, [], function(err, count) {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      let sqlAll = `select ${fields} from ${self.table} ${filterArgs} ${args}`;
      self.db.all(sqlAll, [], function(err, results) {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        let totalPages = count['count(1)'] % limit ? parseInt(count['count(1)'] / limit) + 1 : count['count(1)'] / limit;
        if (totalPages < 1) {
          totalPages = 1;
        }
        resolve({
          data: results,
          totalCount: count['count(1)'],
          totalPages : totalPages,
          page : page,
          limit : limit
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
