# scenario-test
A simple javascript test tool for testing node.js HTTP servers.

Just write the YAML files!


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
```

then, give some scenarios `./scenario/user.yaml`

```yaml
- who: user1 
  what: user.create
  with: "for params (optional)"
  expect: user sign up ok
  obtain: "save response (optional)"

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

    scenario.start()
      .then(function(users) {
        // test finish
        done();
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
