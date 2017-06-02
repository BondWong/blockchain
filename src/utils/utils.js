'use strict';

const crypto = require('crypto');
var secp256k1 = require('secp256k1');

function generateKeys() {
  var pvtKey, pubKey;
  do {
    pvtKey = crypto.randomBytes(32);
  } while (!secp256k1.privateKeyVerify(pvtKey));

  pubKey = secp256k1.publicKeyCreate(pvtKey);
  return [pvtKey, pubKey];
}

function generatePubKeyHash(pubKey) {
  var pubKeyHash = crypto.createHash('sha256').update(pubKey.toString('hex')).digest('hex');
  pubKeyHash = crypto.createHash('ripemd160').update(pubKeyHash).digest('hex');
  return pubKeyHash;
}

function getBlockHash(blockHeader) {
  var blockId = crypto.createHash('sha256').update(blockHeader).digest('hex');
  return crypto.createHash('sha256').update(blockId).digest('hex');
}

function getTransactionHash(transaction) {
  return crypto.createHash('sha256').update(transaction).digest('hex');
}

var exports = module.exports = {};
exports.generateKeys = generateKeys;
exports.generatePubKeyHash = generatePubKeyHash;
exports.getBlockHash = getBlockHash;
exports.getTransactionHash = getTransactionHash;
