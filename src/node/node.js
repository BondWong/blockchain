'use strict';

const crypto = require('crypto');
var merkle = require('merkle-lib');
var merkleProof = require('merkle-lib/proof');
var bigInt = require('big-integer');

const MAXIMUM = 3;
const BLOCKTIME = 1; // 1 minute
const HISTORICALTIMELENGTH = 100; // in reality, it is 2016

function FullNode(ip, port) {
  this.ip = ip;
  this.port = port;
  this.blockchain = {};
}
FullNode.prototype.addBlock = function(block) {
  // assume all blocks are structurally validated
  const preBlockHash = block.getPreBlockHash();
  if (!this.blockchain.has(preBlockHash)) {
    this.blockchain[preBlockHash] = block;
    // to-do: propagate block
  }
}

function Miner(ip, port) {
  FullNode.call(this, ip, port);
  this.blockchain = {};
  this.preBlock;
  this.block;
  this.transactionCache = {};
  this.stop = false;
  this.isStop = false;
  this.diff = 1;
  this.times = [];
  this.nonce = bigInt();
  this.target = bigInt(2).pow(256 - this.diff);
}
Miner.prototype = Object.create(FullNode.prototype);
Miner.prototype.constructor = Miner;
Miner.prototype.addBlock = function(block) {
  // assume all blocks are structurally validated
  const preBlockHash = block.getPreBlockHash();
  if (!this.blockchain.has(preBlockHash)) {
    // verify solution
    const hash = bigInt(crypto.createHash('sha256').update(block.header.nonce.toString('hex')).digest('hex'));
    if (hash.leq(this.target)) {
      this.blockchain[preBlockHash] = block;
      // to-do: propagate block
      // stop this round
      this.stop = true;
      // clean cache
      block.getTransactions().forEach(function(tx) {
        const txHash = utils.getTransactionHash(tx.toBuffer().toString('hex'));
        if (this.transactionCache.has(txHash)) {
          this.transactionCache.delete(txHash);
        }
      });
      // start next round
      while (this.isStop) {
        // update difficulty
        var real = this.times.reduce((acc, val) => acc + val, 0);
        var ideal = this.times.length * BLOCKTIME;
        this.diff = parseInt(this.diff * real / ideal);
        this.mine();
      }
    }
  }
}
Miner.prototype.addTransaction = function(transaction) {
  // assume all transactions are structurally validated
  const tx = transaction.toBuffer().toString('hex');
  const txHash = utils.getTransactionHash(tx);
  if (!this.transactionCache.has(txHash)) {
    this.transactionCache[txHash] = transaction;
  }
}
Miner.prototype.mine = function() {
  this.isStop = false;
  this.stop = false;
  this.block = null;
  this.start = parseInt(this.date().getTime() / 1000 / 60);
  var merkleTree = null;
  while (!stop) {
    if (typeof this.block === 'undefined') {
      var header = new Header();
      if (typeof this.preBlock === 'undefined') {
        var preBlockHash = utils.getBlockHash('Genesis Block');
        header.setPreBlockHash(preBlockHash);
      } else {
        var preBlock = this.preBlock.toBuffer().toString('hex');
        var preBlockHash = utils.getBlockHash(preBlock);
        header.setPreBlockHash(preBlockHash);
      }
      this.block = new Block(header);
    }
    if (this.block.getTxCnt() < MAXIMUM) {
      this.transactionCache.forEach(function(tx) {
        const txHash = utils.getTransactionHash(tx.toBuffer().toString('hex'));
        // no transaction fee bias
        if (this.block.getTxCnt() < MAXIMUM) {
          if (merkleTree === null) {
            this.block.addTransaction(tx);
            merkleTree = merkle(this.block.getTransactions(), sha256);
            this.block.header.setMerkleRoot(Buffer.from(merkleTree[merkleTree.length - 1]));
          } else {
            const proof = merkleProof(merkleTree, txHash);
            if (!merkleProof.verify(proof, sha256)) {
              this.block.addTransaction(tx);
              merkleTree = merkle(this.block.getTransactions(), sha256);
              this.block.header.setMerkleRoot(Buffer.from(merkleTree[merkleTree.length - 1]));
            }
          }
        }
      });
    }
    // calculate
    var hash = bigInt(crypto.createHash('sha256').update(this.nonce.toString()).digest('hex'));
    // found a solution
    if (hash.leq(this.target)) {
      const duration = parseInt(new Date().getTime() / 1000 / 60);
      this.block.header.setNonce(Buffer.from(this.nonce.toString()));
      this.blockHeader.setDiffTarget(Buffer.from(this.diff + ''));
      if (this.times.length == HISTORICALTIMELENGTH) {
        this.times.pop();
      }
      this.times.push(duration);
      // propagate
    } else {
      this.nonce.add(1);
    }
  }

  this.isStop = true;
}

function Wallet(address) {
  this.address = address;
  this.uxto = [];
}
