# scenario-test
A simple javascript test tool for testing node.js HTTP servers.

Just write the YAML files!

## Install

```
$ npm install -g scenario-test
```

## Example

First, create a config file,

`config.yaml` 

```yaml
server: http://localhost:3000
mongodb: mongodb://localhost/test
user: ./user/user.yaml
api:
  - class: user
    path: ./api/user.yaml

scenario: 
  - ./scenario/user.yaml 
```

then, create your users 

`./user/user.yaml`

```yaml
- user_id: user1
  with:
    username: user1
    email: user1@mail.com
    password: user1234
```

and just describe your APIs,

`./api/user.yaml`


```yaml
- API: create
  method: POST
  path: /users
  parameters: 
    username: self.username
    email: self.email
    password: self.password
  response:
    when user sign up ok:
      expect status: 200

- API: login
  method: POST
  path: /login
  parameters:
    username: self.username
    password: self.password
  response:
    when user login ok:
      expect status: 200
      expect header:
        # header to test
      expect body:
        # res.body to test
```

then, give some scenarios `./scenario/user.yaml`

```yaml
- who: user1 
  what: user.create
  with: 
    path_params:
      # ":id": 42398503298092380
    query_params:
      # "limit": 20
    data_params:
      # "body": {}
  expect: user sign up ok
  obtain:
    # _id: res.body_id

- who: user1
  what: user.login
  expect: user login ok
```

finally, write a simple js file, 

```js
var Scenario = require('./index');
var scenario = new Scenario('./config.yaml');

describe('start test', function() {
  it('should pass all tests', function (done) {
    var options = {
      timeout: 3000
    };

    scenario.start(options, done)
      .then(function(res) {
        // test finish
      })
      .catch(function(error) {
        done(error);
      });
  });
});
```

and, run your test by typing

```
$ npm test
```


the result will look like

<img src="http://i.imgur.com/1aBXs47.png" alt="alt text" width="500px">


## API

**Test**

test a scenario

return a promise

```
scenario-test.test(scenario)
  .then(function(res){
      // do your stuff
  })
  .catch(function(err){
      // deal with error
  });
```
