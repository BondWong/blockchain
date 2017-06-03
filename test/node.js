'use strict';

const crypto = require('crypto');
var secp256k1 = require('secp256k1');
var assert = require('assert');
var bigInt = require('big-integer');

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
    // it('should create a new block', function(done) {
    //   var node = new Miner('191.168.2.2', '80');
    //   assert.equal(node.block, null);
    //   node.mine(done);
    //   assert.notEqual(node.block, null);
    // }).timeout(1000 * 60);

    // it('should create a new block and grab transactions', function(done) {
    //   var node = new Miner('191.168.2.2', '80');
    //   for (var i = 0; i < 10; i++) {
    //     var keyPair = utils.generateKeys();
    //     var pvtKey = keyPair[0];
    //     var pubKey = keyPair[1];
    //     var pubKeyHash = utils.generatePubKeyHash(pubKey);
    //     const msg = crypto.randomBytes(32)
    //     var sig = secp256k1.sign(msg, pvtKey);
    //
    //     var txHash = crypto.randomBytes(32);
    //     var outputIdx = crypto.randomBytes(4);
    //     var output = tx.createOutput(2, pubKeyHash);
    //     var input = tx.createInput(txHash, outputIdx, sig.signature, pubKey);
    //     var transaction = tx.createTransaction([input], [output]);
    //     node.transactionCache.set(txHash, transaction);
    //   }
    //
    //   node.mine(done);
    //   assert.equal(node.block.transactions.length, 3);
    // }).timeout(1000 * 60);
  });

  describe('#addBlock', function() {
    it('should add a block if it is not contained', function() {
      var node = new Miner('191.168.2.2', '80');

      var keyPair = utils.generateKeys();
      var pvtKey = keyPair[0];
      var pubKey = keyPair[1];
      var pubKeyHash = utils.generatePubKeyHash(pubKey);
      const msg = crypto.randomBytes(32)
      var sig = secp256k1.sign(msg, pvtKey);

      var txHash = crypto.randomBytes(32).toString('hex');
      var outputIdx = crypto.randomBytes(4).toString('hex');
      var output = tx.createOutput(2, pubKeyHash);
      var input = tx.createInput(txHash, outputIdx, sig.signature.toString('hex'), pubKey.toString('hex'));
      var transaction = tx.createTransaction([input], [output]);

      var header = new Header();
      var preBlockHash = utils.getBlockHash('Genesis Block');
      header.setPreBlockHash(preBlockHash);
      header.setDiffTarget(bigInt(2).pow(256 - 23).toString());
      header.setNonce('15099857');
      header.hash = '9061185796136763734400281842985869907186066594885954112766764407286534';

      var block = new Block(header);
      block.addTransaction(transaction);

      console.log(JSON.stringify(block));

      assert.equal(node.addBlock(block, false), true);
      assert.equal(node.addBlock(block, false), false);
      var preBlockHash = utils.getBlockHash('Genesis Block12');
      header.setPreBlockHash(preBlockHash);
      block.header.hash = Buffer.from('13803492693581127574869511724554050904902217944340773110325048447598594');
      assert.equal(node.addBlock(block, false), false);
      var preBlockHash = utils.getBlockHash('Genesis Block123');
      header.setPreBlockHash(preBlockHash);
      block.header.hash = Buffer.from('13803492693581127574869511724554050904902217944340773110325048447598591');
      assert.equal(node.addBlock(block, false), true);
    });
  });
});
