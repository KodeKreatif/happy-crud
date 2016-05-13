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
    
    if (fields.length < 1) {
      return reject(new Error('Payload should not be empty'));
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
  let page = parseInt(params.page || 1);
  let limit = parseInt(params.limit || 10);
  let sortBy = params.sortBy || 'id';
  let sort = params.sort || 'desc'
  let skip = (page - 1) * limit;
  let args =  ` order by ${sortBy} ${sort} limit ${skip},${limit}`;
  let operator = 'and';
  if (params.operator) {
    operator = params.operator;
  }
  delete(params.page);
  delete(params.limit);
  delete(params.sort);
  delete(params.sortBy);
  delete(params.operator);

  let fields = '*';
  if (params && Array.isArray(params.fields)) {
    fields = params.fields.join(',');
  }
  let schema = Object.keys(self.schema);

  let filterArgs = '';

  // Reserved words
  let reserved = [
    'gt',      // gt(), greater than
    'gte',     // gte(), greater than or equal
    'lt',      // lt(), less than
    'lte',     // lte(), less than or equal
    'search',  // search(), search
  ]

  // Parse reserved word
  let paramsKey = Object.keys(params);
  for (var i in paramsKey) {
    
    // Check for invalid fields
    let validFields = true;
    let f = paramsKey[i].split(',');
    for (var x in f) {
      if (schema.indexOf(f[x]) < 0) {
        validFields = false;
      }
    }
    if (validFields) {
      if ((params[paramsKey[i]].indexOf('(') > -1 && reserved.indexOf(params[paramsKey[i]].split('(')[0]) > -1 || Array.isArray(params[paramsKey[i]]))) {
        if (filterArgs.indexOf('where') < 0) {
          filterArgs += ' where'
        }
        let reservedParams = [];
        if (Array.isArray(params[paramsKey[i]])) {
          for (var j in params[paramsKey[i]]) {
            if (params[paramsKey[i]][j].split('(')[1]) {
              let val = params[paramsKey[i]][j].split('(')[1].slice(0,-1);
              // ISO Date string example 2016-05-13T02:06:43.986Z
              if (val.length == 24 && val[4] === '-' && val[7] === '-' && val[13] === ':' && val[16] === ':' && val[23] === 'Z') {
                val = '\'' + val + '\'';
              }
              reservedParams.push({
                key : params[paramsKey[i]][j].split('(')[0],
                val : val,
              })   
            }
          }
        } else {
          let val = params[paramsKey[i]].split('(')[1].slice(0,-1);
          // ISO Date string example 2016-05-13T02:06:43.986Z
          if (val.length == 24 && val[4] === '-' && val[7] === '-' && val[13] === ':' && val[16] === ':' && val[23] === 'Z') {
            val = '\'' + val + '\'';
          }
          reservedParams= [{
            key : params[paramsKey[i]].split('(')[0],
            val : val,
          }];
        }
        
        for (var k in reservedParams) {
          if (reservedParams[k].key === 'search') {
            if (filterArgs.length > 6) {
              filterArgs += ` ${operator}`;
            }
            // Allows search on multiple fields
            let f = paramsKey[i].split(',');
            let searchArgs = '(';
            for (var i in f) {
              if (searchArgs.length > 1) {
                searchArgs += ' or';
              }
              searchArgs += ` ${f[i]} like '%${reservedParams[k].val}%'`;
            }
            searchArgs += ')';
            filterArgs += ` ${searchArgs}`;
          }
    
          if (reservedParams[k].key === 'gt') {
            if (filterArgs.length > 6) {
              filterArgs += ` ${operator}`;
            }
            filterArgs += ` ${paramsKey[i]} > ${reservedParams[k].val}`;
          }
          
          if (reservedParams[k].key === 'gte') {
            if (filterArgs.length > 6) {
              filterArgs += ` ${operator}`;
            }
            filterArgs += ` ${paramsKey[i]} >= ${reservedParams[k].val}`;
          }
          
          if (reservedParams[k].key === 'lt') {
            if (filterArgs.length > 6) {
              filterArgs += ` ${operator}`;
            }
            filterArgs += ` ${paramsKey[i]} < ${reservedParams[k].val}`;
          }
          
          if (reservedParams[k].key === 'lte') {
            if (filterArgs.length > 6) {
              filterArgs += ` ${operator}`;
            }
            filterArgs += ` ${paramsKey[i]} <= ${reservedParams[k].val}`;
          }
        }
      } else {
        if (filterArgs.indexOf('where') < 0) {
          filterArgs += ' where'
        }
        if (filterArgs.length > 6) {
          filterArgs += ` ${operator}`;
        }
        filterArgs += ` ${paramsKey[i]} = '${params[paramsKey[i]]}'`;
      }
    }
  }

  return new Promise((resolve, reject) => {
    let sqlCount = `select count(1) from ${self.table} ${filterArgs}`;
    self.db.get(sqlCount, [], function(err, count) {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      let totalPages = count['count(1)'] % limit ? parseInt(count['count(1)'] / limit) + 1 : count['count(1)'] / limit;
      if (totalPages < 1) {
        totalPages = 1;
      }
      let sqlAll = `select ${fields} from ${self.table} ${filterArgs} ${args}`;
      self.db.all(sqlAll, [], function(err, results) {
        if (err) {
          console.log(err);
          reject(err);
          return;
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
