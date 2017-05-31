'use strict';

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
  this.block;
  this.transactionCache = new set();
}
Miner.prototype = Object.create(FullNode.prototype);
Miner.prototype.constructor = Miner;
Miner.prototype.addTransaction = function(transaction) {
  // assume all transactions are structurally validated
}

function Wallet(address) {
  this.address = address;
  this.uxto = [];
}
