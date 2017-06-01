'use script';

const {
  Bufferable
} = require('../bufferable.js');

const VERSION = Buffer.alloc(4);
VERSION.writeUInt32BE(1, 0);

function Block(header) {
  Bufferable.call(this);
  this.header = header;
  this.transactions = [];
  this.txCnt = Buffer.alloc(1);
  this.blockSize = Buffer.alloc(4);
  this.blockSize = Buffer.from(this.blockSize.length + this.header.getSize() + this.txCnt.length + '');
}
Block.prototype.addTransaction = function(transaction) {
  this.transactions.push(transaction);
  this.txCnt = Buffer.from(this.transactions.length + '');
  this.blockSize = Buffer.from(this.blockSize.length + transaction.getSize() + '');
};
Block.prototype.getTransactions = function() {
  return this.transactions;
};
Block.prototype.getPreBlockHash = function() {
  return this.header.preBlockHash;
}
Block.prototype.getTxCnt = function() {
  return this.transactions.length;
}
Block.prototype.getSize = function() {
  var size = 0;
  this.transactions.forEach(function(tx) {
    size += tx.getSize();
  });
  size += this.blockSize.length + this.header.getSize() + this.txCnt.length;
  return size;
}
Block.prototype.toBuffer = function() {
  var buffer = [];
  this.transactions.forEach(function(tx) {
    buffer.push(tx.toBuffer());
  });
  var buffer = Buffer.concat([this.blockSize, this.header.toBuffer(), this.txCnt].concat(buffer), this.getSize());
  return buffer;
}

function Header() {
  Bufferable.call(this);
  this.version = VERSION;
  this.timestamp = Buffer.from(new Date().getTime() + '');
  this.merkleRoot = Buffer.alloc(32);
  this.diffTarget = Buffer.alloc(4);
  this.nonce = Buffer.alloc(4);
}
Header.prototype = Object.call(Bufferable.prototype);
Header.prototype.constructor = Header
Header.prototype.setPreBlockHash = function(preBlockHash) {
  this.preBlockHash = preBlockHash;
}
Header.prototype.setMerkleRoot = function(merkleRoot) {
  this.merkleRoot = merkleRoot;
}
Header.prototype.setDiffTarget = function(diffTarget) {
  this.diffTarget = diffTarget;
}
Header.prototype.setNonce = function(nonce) {
  this.nonce = nonce;
}
Header.prototype.getSize = function() {
  return this.version.length + this.preBlockHash.length + this.merkleRoot.length +
    this.diffTarget.length + this.nonce.length + this.timestamp.length;
}
Header.prototype.toBuffer = function() {
  var buffer = Buffer.concat([this.version, this.preBlockHash,
    this.merkleRoot, this.timestamp, this.diffTarget, this.nonce
  ], this.getSize());
  return buffer;
}

var exports = module.exports = {};
exports.Header = Header;
exports.Block = Block;
