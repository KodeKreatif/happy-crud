[![Build Status](https://travis-ci.org/KodeKreatif/happy-crud.svg?branch=master)](https://travis-ci.org/KodeKreatif/happy-crud)

<img src="https://cloud.githubusercontent.com/assets/2534060/14002981/0cfda8ce-f182-11e5-888f-31d76ebae7e3.png">
---
Happy CRUD is a Hapi crud abstraction. There are some ES7 features used in happy-crud, you need to setup Babel ``stage-3`` for your apps.

## Example
Consider the following code:

```
'use strict';
const Hapi = require('hapi');

const server = new Hapi.Server();
const schema = {
  id: {
    type: Number,
    primaryKey: true,
    autoIncrement: true
  },
  a: String,
  b: String,
  c: Number,
}

const options = {
  word: 'user',
  path: '/api',
  mount: '/v1',

  // Example of bypassing auth on one of four routes (create, read, update, list).
  authentications : {
    list : false
  }

  // Example of adding before and after function on one of four routes (create, read, update, list).
  // This useful for custom data manipulation.

  /**
   * The before function should be a promise with 2 parameters :
   *    - request : Hapi's request
   *    - reply : Hapi's reply
   */
  beforeFunc : {
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
  afterFunc : {
    list : function(request, reply, result) {
      return new Promise((resolve, reject) => {
        // Do something after Happy-Crud query. Ex : add something to result.
        result.someKey = 'someString';
        resolve();
      })
    }
  }

}

const db = this.setupDb();
const table = 'testa';
const model = new Sqlite3Model(db, table, schema);
const ctrl = new ControllerA(model);
const api = new HappyCrud(server, ctrl, options);


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

Example usage :

- `/v1/api/users?name=search(omama)` - match the record(s) that has value `hello` in `name` field.
- `/v1/api/users?birthDate=gt(2016-07-03T05:24:02.346Z)` - fetch the record(s) that has newer date than `2016-07-03T05:24:02.346Z`

`gt`, `gte`, `lt` and `lte` also works for date if only the provided value is a valid Date ISO string.


## Database support

Currently it only supports SQLite version 3 and MongoDB. To enable support for another database, you need to implement the actual crud functions by deriving `BaseModel` class (see: `api/base-model.js`)

## License

MIT
