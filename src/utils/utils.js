'use strict';

const crypto = require('crypto');
var secp521k1 = crypto.createECDH('secp521r1');
const sha256 = crypto.createHash('sha256');

function getPvtKey(pvtKey) {
  return sha256.update(pvtKey).digest('hex');
}

function getPubKey(pvtKey) {
  secp521k1.setPrivateKey(pvtKey);
  var pubKey = secp521k1.getPublicKey('hex');
  return pubKey;
}

var exports = module.exports = {};
exports.getPvtKey = getPvtKey;
exports.getPubKey = getPubKey;
