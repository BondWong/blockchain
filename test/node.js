'use strict';

const crypto = require('crypto');
var secp256k1 = require('secp256k1');
var assert = require('assert');

const {
  FullNode,
  Miner
} = require('../src/node/node.js');
const {
  Header,
  Block
} = require('../src/block/block.js');
const tx = require('../src/transaction/transaction.js');
const utils = require('../src/utils/utils.js');

describe('FullNode', function() {
  describe('#addBlock', function() {
    it('should add a block if not existed', function() {
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

      var block = new Block(header);
      block.addTransaction(transaction);

      var node = new FullNode('191.168.2.1', '80');
      assert.equal(node.blockchain.size, 0);
      node.addBlock(block);
      assert.equal(node.blockchain.size, 1);
      node.addBlock(block);
      assert.equal(node.blockchain.size, 1);
    });
  });
});

function done() {
  // do nothing
}

describe('Miner', function() {
  describe('#addTransaction', function() {
    it('should add a transaction if not existed', function() {
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

      var node = new Miner('191.168.2.2', '80');
      assert.equal(node.transactionCache.size, 0);
      node.addTransaction(transaction);
      assert.equal(node.transactionCache.size, 1);
      node.addTransaction(transaction);
      assert.equal(node.transactionCache.size, 1);
    });

    it('should add a transaction to block if there is space and the transaction is not included', function() {
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

      var node = new Miner('191.168.2.2', '80');
      node.addTransaction(transaction);
      assert.equal(node.block.transactions.length, 1);
      var merkleHash = node.block.header.merkleRoot;
      node.addTransaction(transaction);
      assert.equal(node.block.header.merkleRoot, merkleHash);
    });

    it('should transactions to the block if there is space and the transaction is not included', function() {
      var node = new Miner('191.168.2.2', '80');
      for (var i = 0; i < 10; i++) {
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
        node.addTransaction(transaction);
        if (i + 1 <= 3) {
          assert.equal(node.block.transactions.length, i + 1);
        } else {
          assert.equal(node.block.transactions.length, 3);
        }
      }
    });
  });

  describe('#mine', function() {
    it('should create a new block', function(done) {
      var node = new Miner('191.168.2.2', '80');
      assert.equal(node.block, null);
      node.mine(done);
      assert.notEqual(node.block, null);
    }).timeout(1000 * 60);

    it('should create a new block and grab transactions', function(done) {
      var node = new Miner('191.168.2.2', '80');
      for (var i = 0; i < 10; i++) {
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
        node.transactionCache.set(txHash, transaction);
      }

      node.mine(done);
      assert.equal(node.block.transactions.length, 3);
    }).timeout(1000 * 60);
  });
});
