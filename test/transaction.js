'use script';

const crypto = require('crypto');
var secp256k1 = require('secp256k1');

const tx = require('../src/transaction/transaction.js');
const utils = require('../src/utils/utils.js');

describe('Transaction', function() {
  describe('#createOutput #createOutput #createTransaction', function() {
    it('should return an output, an input and a transaction', function() {
      var keyPair = utils.generateKeys();
      var pvtKey = keyPair[0];
      var pubKey = keyPair[1];
      var pubKeyHash = utils.generatePubKeyHash(pubKey);
      const msg = crypto.randomBytes(32)
      var sig = secp256k1.sign(msg, pvtKey);

      var txHash = crypto.randomBytes(32);
      var outputIdx = crypto.randomBytes(4);
      var output = tx.createOutput(2, pubKeyHash);
      var input = tx.createInput(txHash, outputIdx, sig, pubKey);
      var transaction = tx.createTransaction([input], [output]);
    })
  });
});
