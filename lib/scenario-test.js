var request = require("supertest-as-promised");
var _ = require('lodash');
var util= require('util');
var Promise = require("bluebird");
var path = require('path');
var should = require('should');

var utils = require('./utils');
var User = require('./user');
var API = require('./api');
var Scenario = require('./scenario');

function script_test(config_yaml, options) {
  this.config = utils.loadyaml(config_yaml);
  this.app = this.config.server;

  this.APIs = {};
  this.users = {};
  this.scenarios = [];
  
  try {
    this._initUsers();
    this._initAPIs();
    this._initScenarios();
  }
  catch(e) {
    console.log(e);
  }
}

script_test.prototype._initUsers = function() {
  var self = this;
  var specs = utils.loadyaml(this.config.user);

  specs.forEach(function(spec) {
    var user = new User(spec);
    var agent = request.agent(self.app);
    user.setAgent(agent);
    self.users[spec.user_id] = user;

  });
};

script_test.prototype._initAPIs = function() {
  var self = this;

  this.config.api.forEach(function(apiClass) {
    var specs = utils.loadyaml(apiClass.path);

    specs.forEach(function(spec) {
      var key = apiClass.class + '.' + spec.API;
      self.APIs[key] = new API(spec);
    });
  });
};

script_test.prototype._initScenarios = function() {
  var self = this;

  this.config.scenario.forEach(function(_path) {
    var scenarios = utils.loadyaml(_path);

    scenarios.forEach(function(s) {
      self.scenarios.push(new Scenario(s));
    });

  });
};

script_test.prototype.start = function(options, done) {
  var self = this;
  self.options = options;
  done();

  return Promise.map(self.scenarios, function(s) {  
      return self.test(s);
    })
    .then(function(res) {
      return res;
  });
};

script_test.prototype.test = function(scenario) {

  var self = this;

  var user = self.users[scenario.who];
  var api = self.APIs[scenario.what];
  var to = self.users[scenario.to] || {};
  var expects;

  should.exist(user, "User " + scenario.who + ' should exist');
  should.exist(api, "API " + scenario.what + ' should exist');

  expects = utils.formatExpects(api.response['when ' + scenario.expect]);
  should.exist(api, "Expects " + scenario.expects + ' should exist');

  return new Promise(function(resolve) {
   
    describe(self._getDescribe(user, api), function (){
      it(self._getShould(scenario.expect), function(done){
        this.timeout(self.options.timeout);

        var scenario_params = scenario.with || {};
        // req path
        var path = utils.formatPath(user.props, api.path, scenario_params.path_params, 
            api.query, scenario_params.query_params, to);

        // data to send
        var params = utils.formatParams(user.props, api.parameters, 
            scenario_params.data_params, to);

        console.log('  path: ', path);
        console.log('  params: ', params);
       
        // send request
        var req = user.request(api, path, params, to);

        // status code
        req.expect(expects.status);

        // expect body
        if (expects.body) {
          req.expect(utils.formatParams(user.props, expects.body,
            scenario_params.body_params, to));
        }
  
        // expect header
        for (var key in expects.header) {
          req.expect(key, expects.header[key]);
        }

        // save res
        req.then(function(res) {
            user.saveResponse(scenario.obtain, res);
            return res;
          })
          .then(function(res) {
            resolve(res);
            done();
          })
          .catch(function(error) {
            resolve();
            done(error);
          });
      });
    });
  });
};

script_test.prototype._getDescribe = function(user, api) {
  return util.format('%s -> %s %s', user.user_id, api.method, api.path);
};

script_test.prototype._getShould = function(expect) {
  return util.format('should %s', expect);
};


module.exports = script_test;
