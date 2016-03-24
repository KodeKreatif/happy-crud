Happy CRUD is a Hapi crud abstraction.

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
}

const db = this.setupDb();
const table = 'testa';
const model = new Sqlite3Model(db, table, schema);
const ctrl = new ControllerA(model);
const api = new HappyCrud(server, ctrl, options);


```

By using the code, you will have a complete CRUD endpoints at `/v1/api/user` and `/v1/api/users` (depending on the request)

## Database support

Currently it only supports SQLite version 3 and MongoDB. To enable support for another database, you need to implement the actual crud functions by deriving `BaseModel` class (see: `api/base-model.js`)

## License

MIT
