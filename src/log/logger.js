'use strict';

const chalk = require('chalk');

function Logger(who) {
  this.who = who;
}
Logger.prototype.log = function(text) {
  console.log(chalk.green(`${this.who}: ${text}`));
}
Logger.prototype.error = function(text) {
  console.log(chalk.red(`${this.who}: ${text}`));
}

var exports = module.exports = {};
exports.Logger = Logger;
