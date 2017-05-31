'use strict';

const crypto = require('crypto');
var secp256k1 = require('secp256k1');

const {Header, Block} = require('../src/block/block.js');
const tx = require('../src/transaction/transaction.js');
const utils = require('../src/utils/utils.js');

describe('Block', function() {
  describe('#Block #Header', function() {
    it('should return a block', function() {
      var keyPair = utils.generateKeys();
      var pvtKey = keyPair[0];
      var pubKey = keyPair[1];
      var pubKeyHash = utils.generatePubKeyHash(pubKey);
      const msg = crypto.randomBytes(32)
      var sig = secp256k1.sign(msg, pvtKey);

      var txHash = crypto.randomBytes(32);
      var outputIdx = crypto.randomBytes(4);
      var output = tx.createOutput(2, pubKeyHash);
      var input = tx.createInput(txHash, outputIdx, sig.signature, pubKey);
      var transaction = tx.createTransaction([input], [output]);

      var header = new Header();
      var preBlockHash = utils.getBlockHash('1');
      header.setPreBlockHash(preBlockHash);
      header.setMerkleRoot(preBlockHash);
      header.setDiffTarget(preBlockHash);
      header.setNonce(preBlockHash);
      header.getSize();
      header.toBuffer();

      var block = new Block(header);
      block.addTransaction(transaction);
      block.getSize();
      block.toBuffer();
    })
  });
});
