var utils = require('./utils');
var _ = require('lodash');

function Scenario(elements) {
  utils.updateProps.call(this, elements);
}

module.exports = Scenario;
