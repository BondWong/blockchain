'use strict';

const crypto = require('crypto');
var assert = require('assert');

var script = require('../src/transaction/script/script.js');
const utils = require('../src/utils/utils.js');

describe('Script', function() {
  describe('#execute', function() {
    it('should return stack with only true as element', function() {
      var keyPair = utils.generateKeys();
      var pvtKey = keyPair[0];
      var pubKey = keyPair[1];
      var pubKeyHash = utils.generatePubKeyHash(pubKey);
      const msg = crypto.randomBytes(32)

      var unlockingScript = script.createUnlockingScript(msg, pvtKey, pubKey.toString('hex'));
      var lockingScript = script.createLockingScript(pubKeyHash);
      assert.equal(script.execute(msg, unlockingScript, lockingScript)[0], true);
    })
  });
});
