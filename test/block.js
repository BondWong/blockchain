'use strict';

const crypto = require('crypto');
var secp256k1 = require('secp256k1');
var assert = require('assert');

const {
  Header,
  Block
} = require('../src/block/block.js');
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
      var input = tx.createInput(txHash, outputIdx, pvtKey, pubKey);
      var transaction = tx.createTransaction([input], [output]);

      var header = new Header();
      var preBlockHash = utils.getBlockHash('1');
      header.setPreBlockHash(preBlockHash);
      header.setMerkleRoot(preBlockHash);
      header.setDiffTarget(preBlockHash);
      header.setNonce(preBlockHash);
      header.getSize();

      var block = new Block(header);
      block.addTransaction(transaction);
    })
  });

  describe('#contains', function() {
    it('should return false if a block does not contain a certain tx', function() {
      var keyPair = utils.generateKeys();
      var pvtKey = keyPair[0];
      var pubKey = keyPair[1];
      var pubKeyHash = utils.generatePubKeyHash(pubKey);
      const msg = crypto.randomBytes(32)
      var sig = secp256k1.sign(msg, pvtKey);

      var txHash = crypto.randomBytes(32);
      var outputIdx = crypto.randomBytes(4);
      var output = tx.createOutput(2, pubKeyHash);
      var input = tx.createInput(txHash, outputIdx, pvtKey, pubKey);
      var transaction = tx.createTransaction([input], [output]);

      var header = new Header();
      var preBlockHash = utils.getBlockHash('1');
      header.setPreBlockHash(preBlockHash);

      var block = new Block(header);
      assert.equal(block.contains(transaction), false);
      block.addTransaction(transaction);
      const merkleRoot = block.header.merkleRoot;
      assert.equal(block.contains(transaction), true);
      assert.equal(block.header.merkleRoot, merkleRoot);
    });
  });

  describe('#addTransaction', function() {
    it('should append tx and txbuffer and update merkle tree and root', function() {
      var keyPair = utils.generateKeys();
      var pvtKey = keyPair[0];
      var pubKey = keyPair[1];
      var pubKeyHash = utils.generatePubKeyHash(pubKey);
      const msg = crypto.randomBytes(32)
      var sig = secp256k1.sign(msg, pvtKey);

      var txHash = crypto.randomBytes(32);
      var outputIdx = crypto.randomBytes(4);
      var output = tx.createOutput(2, pubKeyHash);
      var input = tx.createInput(txHash, outputIdx, pvtKey, pubKey);
      var transaction = tx.createTransaction([input], [output]);

      var header = new Header();
      var preBlockHash = utils.getBlockHash('1');
      header.setPreBlockHash(preBlockHash);

      var block = new Block(header);
      assert.equal(block.merkleTree, null);
      assert.equal(block.header.merkleRoot, null);
      assert.equal(block.transactions.length, 0);
      assert.equal(block.transactionsBuffer.length, 0);
      block.addTransaction(transaction);
      assert.equal(block.transactions.length, 1);
      assert.equal(block.transactionsBuffer.length, 1);
      assert.notEqual(block.merkleTree, null);
      assert.notEqual(block.header.merkleRoot, null);
    });
  });
});
