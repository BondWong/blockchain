'use strict';

const crypto = require('crypto');
var secp256k1 = require('secp256k1');
const http = require('http');

function propagate(data, host, port, path, logger) {
  const options = {
    hostname: host,
    port: port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  http.request(options, (response) => {
    const {
      statusCode
    } = response;

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
        `Status Code: ${statusCode}`);
    }
    if (error) {
      logger.error(error.message);
      // consume response data to free up memory
      response.resume();
      return;
    }
  }).on('error', (e) => {
    logger.error(`got error: ${e.message}`);
  });
}

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

function getHash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest()
}

var exports = module.exports = {};
exports.generateKeys = generateKeys;
exports.generatePubKeyHash = generatePubKeyHash;
exports.getBlockHash = getBlockHash;
exports.getTransactionHash = getTransactionHash;
exports.sha256 = sha256;
exports.getHash = getHash;
exports.propagate = propagate;
