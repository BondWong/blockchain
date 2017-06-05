'use strict';

const POOLSIZE = 20;

function RequestManager() {
  this.pool = [];
}
RequestManager.prototype.append = function(request) {
  if (this.pool.length >= POOLSIZE) {
    this.pool.splice(0, 1);
  }
  this.pool.push(request);
}

var exports = module.exports = {};
exports.RequestManager = RequestManager;
