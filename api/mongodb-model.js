'use strict';

const BaseModel = require('../api/base-model');
const mongoose = require('mongoose');
class MongoDbModel extends BaseModel {

constructor(col, schema) {
  super(null, col, schema);

  this.model = function(){
    var registered = false;
    var m;
    try {
      m = mongoose.model(col);
      registered = true;
    } catch(e) {
      // Do nothing. If there is an error, new scheam will be initiated
    }
    if (registered) return m;
    var s = new mongoose.Schema(schema, {collection : col});
    m = mongoose.model(col, s);
    return m;
  }
  this.impl.create = this.mongoCreate;
  this.impl.read = this.mongoRead;
  this.impl.update = this.mongoUpdate;
  this.impl.delete = this.mongoDelete;
  this.impl.list = this.mongoList;
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
  var params = params | {};
  return new Promise((resolve, reject) => {
    self.model().find(params, (err, result) => {
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