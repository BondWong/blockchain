'use strict';

var assert = require('assert');
const utils = require('../src/utils/utils.js');

describe('utils', function() {
  describe('#getPubKey', function() {
    it('should return public key', function() {
      var privateKey = '123456';
      utils.getPubKey(privateKey);
    })
  });
});
