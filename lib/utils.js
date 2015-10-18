var yaml = require('js-yaml');
var util= require('util');
var _ = require('lodash');
var fs   = require('fs');
var should = require('should');

exports.loadyaml = function(filePath) {
  try {
    return yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.log(e);
  }
};

exports.updateProps = function(properties) {
  for(var key in properties) {
    this[key] = properties[key];
  }
};

exports.formatParams = function(props, paramsTemplate, argv, to) {
  var result = {};
  var data = {};
  data.self = props;
  data.argv = argv || {};
  data.to = to.props || {};

  // return self, argv or to
  if (_.isString(paramsTemplate) && data.hasOwnProperty(paramsTemplate)) {
    return data[paramsTemplate];
  }

  for(var key in paramsTemplate) {
    result[key] = deepGet(data, paramsTemplate[key]);
  }

  return result;
};

exports.formatPath = function(props, path, path_params, query, query_params, to) {
  var data = {};
  data.self = props;
  data.argv = query_params || {};
  data.to = to.props || {};
  path_params = path_params || {};

  for(var key in path_params) {
    path_params[key] = deepGet(data, path_params[key]);
    path = path.replace(key, path_params[key]);
  }
  
  if (query) {
    path += '?';
    for (var i in query) {
      value = deepGet(data, query[i]);
      if (query[i] !== undefined) {
        path += util.format('%s=%s&', key, query[i]);
      }
    }
  }

  return path;
};

/*
 * convert 'expect `key`': value to key : value
 * */
exports.formatExpects = function(obj) {
  var expects = {};
  for (var key in obj) {
    expects[key.substr(key.indexOf(' ')+1)] = obj[key];
  }
  return expects;
};

var deepGet = exports.deepGet = function (obj, keys) {
  if (!_.isString(keys) || keys.indexOf('.') === -1) {
    return keys;
  }

  var arr = keys.split('.');
  var result = obj;
  var reg = /(.*)\[(\d)\]/; // $1[$2]

  arr.forEach(function(key) {
    var match = null;

    if (key.indexOf('[') !== -1) {
      match = reg.exec(key);
      key = match[1];
    }

    if (!result.hasOwnProperty(key)) {
      console.log('Warninig: ' +  key + ' get undefined');
    }

    result = result[key];

    if (match) result = result[match[2]];
  });

  return result;
};

