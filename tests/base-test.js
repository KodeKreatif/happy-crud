'use strict';

class BaseTest {

constructor(server) {
  this.server = server;
  this.auth = null;
}

setAuth(data) {
  this.auth = data;
}

createPostRequest(data) {
  const self = this;
  const request = {
    method: 'POST',
    url: data.url,
    payload: data.payload,
    headers: {}
  };

  if (self.auth) {
    request.headers['authorization'] = self.auth;
  }
  return request;
}

createGetRequest(data) {
  const self = this;
  const request = {
    method: 'GET',
    url: `${data.url}`,
    headers: {}
  };

  if (self.auth) {
    request.headers['authorization'] = self.auth;
  }
  return request;
}

createPutRequest(data) {
  const self = this;
  const request = {
    method: 'PUT',
    url: data.url,
    payload: data.payload,
    headers: {}
  };

  if (self.auth) {
    request.headers['authorization'] = self.auth;
  }
  return request;
}



initController() {
  const self = this;


}

init() {
  const self = this;
  self.initController();
}

doTest() {
}

test(server) {
  const self = this;
  self.init();
  self.doTest();
}

} // class TestA

module.exports = BaseTest;
