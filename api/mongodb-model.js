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
  delete(params.page);
  delete(params.limit);
  let skip;
  if (limit === 0) {
    skip = 0;
  } else {
    skip = (page - 1) * limit;
  }
  let args = {};

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

    if ((params[paramsKey[i]].indexOf('(') > -1 && reserved.indexOf(params[paramsKey[i]].split('(')[0]) > -1 || Array.isArray(params[paramsKey[i]]))) {

      if (!args['$and']) {
        args['$and'] = [];
      }
      let reservedParams = [];
      if (Array.isArray(params[paramsKey[i]])) {
        for (var j in params[paramsKey[i]]) {
          let val = params[paramsKey[i]][j].split('(')[1].slice(0,-1);
          reservedParams.push({
            key : params[paramsKey[i]][j].split('(')[0],
            val : val,
          })   
        }
      } else {
        let val = params[paramsKey[i]].split('(')[1].slice(0,-1);
        reservedParams= [{
          key : params[paramsKey[i]].split('(')[0],
          val : val,
        }];
      }
      for (var k in reservedParams) {
        if (reservedParams[k].key === 'search') {
          args['$and'].push({});
          let index = args['$and'].length - 1;
          let regex = new RegExp(reservedParams[k].val, 'i');
          args['$and'][index][paramsKey[i]] = regex;
        }
  
        if (reservedParams[k].key === 'gt') {
          args['$and'].push({});
          let index = args['$and'].length - 1;
          args['$and'][index][paramsKey[i]] = { '$gt' : reservedParams[k].val };
        }
        
        if (reservedParams[k].key === 'gte') {
          args['$and'].push({});
          let index = args['$and'].length - 1;
          args['$and'][index][paramsKey[i]] = { '$gte' : reservedParams[k].val };
        }
        
        if (reservedParams[k].key === 'lt') {
          args['$and'].push({});
          let index = args['$and'].length - 1;
          args['$and'][index][paramsKey[i]] = { '$lt' : reservedParams[k].val };
        }
        
        if (reservedParams[k].key === 'lte') {
          args['$and'].push({});
          let index = args['$and'].length - 1;
          args['$and'][index][paramsKey[i]] = { '$lte' : reservedParams[k].val };
        }
      }
    } else {
      args[paramsKey[i]] = params[paramsKey[i]];
    }
  }

  // Clear empty array
  if (args['$and'] && args['$and'].length < 1) {
    delete(args['$and']);
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
