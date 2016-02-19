'use strict';

const BaseModel = require('../api/base-model');
const mongoose = require('mongoose');
class MongoDbModel extends BaseModel {

constructor(db, col, schema) {
  db = function(){
    var registered = false;
    var m;
    try {
      m = mongoose.model(col);
      registered = true;
    } catch(e) {
    }
    if (registered) return m;
    var s = new mongoose.Schema(schema, {collection : col});
    m = mongoose.model(col, s);
    return m;
  }
  super(db, col, schema);


  this.impl.create = this.mongoCreate;
  this.impl.read = this.mongoRead;
  this.impl.update = this.mongoUpdate;
  this.impl.delete = this.mongoDelete;
  this.impl.list = this.mongoList;
}

mongoCreate(data) {
  const self = this;
  return new Promise((resolve, reject) => {
    self.db().create(data, (err, result) => {
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
    self.db().findOne({_id:key}, (err, result) => {
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
    self.db().findOneAndUpdate({_id: key}, data, (err, result) => {
      if (err) {
        return reject(err);
      }
      self.db().findOne({_id:key}, (err, result) => {
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
    self.db().remove({_id : key}, (err) => {
      if (err) {
        return reject(err);
      }
      resolve({success : true});
    })
  });
}

mongoList(params) {
  const self = this;
  var params = params | {};
  return new Promise((resolve, reject) => {
    self.db().find(params, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve({
        data: result,
        totalCount: result.length
      });
    });
  });
}




} // class MongoDbModel
module.exports = MongoDbModel;
