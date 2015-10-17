var yaml = require('js-yaml');
var util= require('util');
var _ = require('lodash');
var fs   = require('fs');

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

exports.formatParams = function(props, paramsTemplate, params, to) {
  var result = {};
  var data = {};
  data.self = props;
  data.options = params.options || {};
  data.result = {};
  data.person = to.props || {};

  for(var key in paramsTemplate) {
    result[key] = _getVar(data, paramsTemplate[key]);
  }  
  return result;
};

exports.formatPath = function(props, path, params, query, to) {
  var pathParams = params.pathParams || {};
  var data = {};
  data.self = props;
  data.to = to.props || {};

  _.forIn(pathParams, function(value, key) {
    if (value.indexOf('.') !== -1) {
      value = _getVar(data, value);
    }
    path = path.replace(key, value);
  });
  
  if (query) path += '?';

  _.forIn(query, function(value, key) {
    path += util.format('%s=%s&', key, value);
  });

  return path;
};

exports.formatExpects = function(obj) {
  var expects = {};
  for (var key in obj) {
    expects[key.substr(key.indexOf(' ')+1)] = obj[key];
  }
  return expects;
};

exports.deepGet = function(obj, keys) {
  var keyArray = keys.split('.');
  var result = obj;

  keyArray.forEach(function(key) {
    result = result[key];
  });

  return result;
};

function _getVar(data, value) {
  var arr = value.split('.');
  return data[ arr[0] ][ arr[1] ];
}
