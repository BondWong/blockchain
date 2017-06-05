'use strict';

var assert = require('assert');
const utils = require('../src/utils/utils.js');

describe('utils', function() {
  describe('#getPubKey', function() {
    it('should return private key and public key', function() {
      utils.generateKeys();
    });
  });

  describe('#generatePubKeyHash', function() {
    it('should return a public key hash', function() {
      var pubKeyHash = utils.generatePubKeyHash(utils.generateKeys()[1]);
    });
  });
});
