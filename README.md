# scenario-test
A simple javascript test tool for testing node.js HTTP servers.

Just write the YAML files!


## Example

First, create the YAML files...

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

`./user/user.yaml`

```yaml
- user_id: user1
  with:
    username: user1
    email: user1@mail.com
    password: user1234
```

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

`./scenario/user.yaml`

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

then, write a simple js file, 

```js
var Scenario = require('./index');
var scenario = new Scenario('./config.yaml');

describe('start test', function() {
  it('should pass all tests', function () {

    scenario.start()
      .then(function(users) {
        // test finish
        
      })
      .catch(function(error) {
        console.log(error);
      });
  });
});
```

and, run your test by typing

```
$ npm test
```


finally, that’s the result 


<img src="http://i.imgur.com/1aBXs47.png" alt="alt text" width="500px">
