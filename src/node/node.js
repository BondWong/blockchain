'use strict';

var merkle = require('merkle-lib');
var merkleProof = require('merkle-lib/proof');

const MAXIMUM = 3;

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
}
Miner.prototype = Object.create(FullNode.prototype);
Miner.prototype.constructor = Miner;
Miner.prototype.addTransaction = function(transaction) {
  // assume all transactions are structurally validated
  const tx = transaction.toBuffer().toString('hex');
  const txHash = utils.getTransactionHash(tx);
  if (!this.transactionCache.has(txHash)) {
    this.transactionCache[txHash] = transaction;
  }
}
Miner.prototype.mine = function() {
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
      header.setDiffTarget(Buffer.from('1'));
      header.setNonce(Buffer.from('1'));
      this.block = new Block(header);
    }
    if (this.block.getTxCnt() < MAXIMUM) {
      this.transactionCache.forEach(function(tx) {
        const txHash = utils.getTransactionHash(tx.toBuffer().toString('hex'));
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
  }
  // no transaction fee bias
  if (this.block.getTxCnt() <= MAXIMUM) {
    this.block.add(transaction);
  }
}

function Wallet(address) {
  this.address = address;
  this.uxto = [];
}
