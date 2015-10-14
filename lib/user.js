var utils = require('./utils');
var _ = require('lodash');

function User(spec) {
  this.props = {};
  this.user_id = spec.user_id;
  this.updateProps(spec.with);
}

User.prototype.updateProps = function(properties) {
  for(var key in properties) {
    this.props[key] = properties[key];
  }
};

User.prototype.setAgent = function(agent) {
  this.agent = agent;
};

User.prototype.request = function(api, options, to) {
  options = options || {};

  var self = this;
  var method = api.method.toLowerCase();
  var path = utils.formatPath(self.props, api.path, options, api.query);
  var params = utils.formatParams(self.props, api.parameters, options, to);

  switch(method) {
    case "get":
      return self.agent
        .get(path)
        .set('Accept', 'application/json');

    case "post":
      return self.agent
        .post(path)
        .send(params);

    case "delete":
      return self.agent
        .delete(path);

    case "put":
      return self.agent
        .put(path)
        .send(params);
  }
};

User.prototype.saveResponse = function(obtain, res) {
  if (!obtain) { 
    return;
  }

  var self = this;

  _.forIn(obtain, function(res_keys, key) {
    self.props[key] = utils.deepGet({res: res}, res_keys); 
  });
};

module.exports = User;
