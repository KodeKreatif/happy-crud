[![Build Status](https://travis-ci.org/KodeKreatif/happy-crud.svg?branch=master)](https://travis-ci.org/KodeKreatif/happy-crud)

<img src="https://cloud.githubusercontent.com/assets/2534060/14002981/0cfda8ce-f182-11e5-888f-31d76ebae7e3.png">
---
Happy CRUD is a Hapi crud abstraction. There are some ES7 features used in happy-crud, you need to setup Babel ``stage-3`` and these babel dependencies :

- babel-core
- babel-preset-stage-3
- babel-polyfill

## Example
Consider the following code:

```
'use strict';

// This tiny hack is needed
require('babel-register')({
  "only" : ["node_modules/happy-crud/api/*.js", "index.js"]
})

const Hapi = require('hapi');
const Sqlite3 = require('sqlite3');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8000
});

// Load the Happy-Crud
const Happy = require('happy-crud');

var User = function(server, options, next) {
  this.server = server;

  options.schema = {
    id: {
      type: Number,
      primaryKey: true,
      autoIncrement: true
    },
    name: String,
    age: String,
    createdAt: Date,
  };
  options.db = new Sqlite3.Database('/tmp/data.db');
  options.dbType = 'sqlite3';
  options.word = 'user';
  options.path = '/api';
  options.mount = '/';
  options.table = 'users';

  // Example of bypassing auth on one of four routes (create, read, update, list).
  options.authentications = {
    list : false
  }

  /**
   * Example of adding before and after function on one of four routes (create, read, update, list).
   * This useful for custom data manipulation.
   *
   * The before function should be a promise with 2 parameters :
   *    - request : Hapi's request
   *    - reply : Hapi's reply
   */
  options.beforeFunc = {
    list : function(request, reply) {
      return new Promise((resolve, reject) => {
        // Do something before Happy-Crud query. Ex : manipulate payload.
        resolve();
      })
    }
  }

  /**
   * The after function should be a promise with 3 parameters :
   *    - request : Hapi's request
   *    - reply : Hapi's reply
   *    - result : The result object of Hapy-Crud query. You could manipulate this result before pass it to reply();
   */
  options.afterFunc = {
    list : function(request, reply, result) {
      return new Promise((resolve, reject) => {
        // Do something after Happy-Crud query. Ex : add something to result.
        result.someKey = 'someString';
        resolve();
      })
    }
  }

  // Initiate the happiness
  this.happy = new Happy(server, options);

}

// Declare the plugin
const UserPlugin = function(server, options, next) {
  new User(server, options, next);
  next();
};
UserPlugin.attributes = {
  pkg : {
    name : 'users'
  }
}

// Register the plugin
server.register([UserPlugin], (err) => {
  if (err) {
    console.log('Failed to load plugin');
  }
})

// Start the server
server.start((err) => {
  if (err) {
     throw err;
  }
  console.log('Server running at:', server.info.uri);
});

```

By using the code, you will have a complete CRUD endpoints at `/v1/api/user` and `/v1/api/users` (depending on the request)

On `list` method, you could do a simple database query directly from URL address, like :

- `/v1/api/users?name=Omama&age=19`

Happy CRUD has some reserved words that used as helper in query :

- `search` - search
- `gt` - greater than
- `gte` - greather than or equal
- `lt` - less than
- `lte` - less than or equal
- `!` - negation

Example usage :

- `/v1/api/users?name=search(omama)` - match the record(s) that has value `hello` in `name` field.
- `/v1/api/users?birthDate=gt(2016-07-03T05:24:02.346Z)` - fetch the record(s) that has newer date than `2016-07-03T05:24:02.346Z`
- `/v1/api/users?name=!(omama)` - match the record(s) that it's `name` field does not equal to `omama`.

`gt`, `gte`, `lt` and `lte` also works for date if only the provided value is a valid Date ISO string.


## Database support

Currently it only supports SQLite version 3 and MongoDB. To enable support for another database, you need to implement the actual crud functions by deriving `BaseModel` class (see: `api/base-model.js`)

## License

MIT
