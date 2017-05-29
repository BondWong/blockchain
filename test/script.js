'use strict';

const crypto = require('crypto');
const sign_sha256 = crypto.createSign('sha256');
const sha256 = crypto.createHash('sha256');
const ripemd160 = crypto.createHash('ripemd160');
var assert = require('assert');

var Script = require('../src/transaction/script/script.js');
const utils = require('../src/utils/utils.js');

const STARTLINE = '-----BEGIN EC PRIVATE KEY-----';
const ENDLINE = '-----END EC PRIVATE KEY-----';

describe('Script', function() {
  describe('#execute', function() {
    it('should return stack with only true as element', function() {
      var pvtKey = utils.getPvtKey('123456');
      var pubKey = utils.getPubKey(pvtKey);
      var pubKeyHash = sha256.update(pubKey).digest('hex');
      pubKeyHash = ripemd160.update(pubKeyHash).digest('hex');
      sign_sha256.update('test');
      var sig = sign_sha256.sign(pvtKey, 'hex');

      var unlockingScript = Script.createUnlockingScript(sig, pubKey);
      var lockingScript = Script.createLockingScript(pubKeyHash);
    })
  });
});
