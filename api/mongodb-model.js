'use strict';

const BaseModel = require('../api/base-model');
const mongoose = require('mongoose');
const events = require('events');

class MongoDbModel extends BaseModel {

constructor(db, col, schema) {
  super(null, col, schema);
  var self = this;
  this.impl.create = this.mongoCreate;
  this.impl.read = this.mongoRead;
  this.impl.update = this.mongoUpdate;
  this.impl.delete = this.mongoDelete;
  this.impl.list = this.mongoList;
  
  // Setup db and emit 'ready' when connection succeeded
  mongoose.connect(db);
  mongoose.connection.once('open', () => {
    self.model = function(){
      var registered = false;
      var m;
      try {
        m = mongoose.model(col);
        registered = true;
      } catch(e) {
        // Do nothing. If there is an error, new schema will be initiated
      }
      if (registered) return m;
      var s = new mongoose.Schema(schema, {collection : col});
      m = mongoose.model(col, s);
      return m;
    }
    self.emit('ready');
  })
}

mongoCreate(data) {
  const self = this;
  return new Promise((resolve, reject) => {
    self.model().create(data, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    })
  });
}

mongoRead(key, filter) {
  const self = this;
  var filter = filter | {};
  return new Promise((resolve, reject) => {
    self.model().findOne({_id:key}, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

mongoUpdate(key, data) {
  const self = this;
  return new Promise((resolve, reject) => {
    self.model().findOneAndUpdate({_id: key}, data, (err, result) => {
      if (err) {
        return reject(err);
      }
      self.model().findOne({_id:key}, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  });
}

mongoDelete(key) {
  const self = this;
  return new Promise((resolve, reject) => {
    self.model().remove({_id : key}, (err) => {
      if (err) {
        return reject(err);
      }
      resolve({success : true});
    })
  });
}

mongoList(params) {
  const self = this;
  let page = parseInt(params.page || 1);
  let limit = parseInt(params.limit || 10);
  let skip = (page - 1) * limit;
  let args = {};
  if (params.filterKey && params.filterValue) {
    if (!args['$or']) {
      args['$or'] = [];
    }
    args['$or'].push({});
    args['$or'][0][params.filterKey] = params.filterValue;
  }
  if (params.searchKey && params.searchValue) {
    if (!args['$or']) {
      args['$or'] = [];
    }
    args['$or'].push({});
    let index = args['$or'].length - 1;
    let regex = new RegExp(params.searchValue, 'i');
    args['$or'][index][params.searchKey] = regex;
  }
  return new Promise((resolve, reject) => {
    self.model().count(args, (err, count) => {
      if (err) {
        return reject(err);
      }
      self.model().find(args).skip(skip).limit(limit).exec((err, result) => {
        if (err) {
          return reject(err);
        }
        resolve({
          data: result,
          totalCount: count,
          totalPages : count % limit ? parseInt(count / limit) + 1 : count / limit,
          page : page,
          limit : limit
        });
      });
    })
  });
}

} // class MongoDbModel

// Add event emitter capabilities to the class
Object.keys(events.EventEmitter.prototype).forEach((prop) => {
  MongoDbModel.prototype[prop] = events.EventEmitter.prototype[prop];
})
events.EventEmitter.call(MongoDbModel);

module.exports = MongoDbModel;
