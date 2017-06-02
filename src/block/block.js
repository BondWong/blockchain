'use script';

const VERSION = '1';

function Block(header) {
  this.header = header;
  this.transactions = [];
  this.txCnt = null;
  this.blockSize = null;
}
Block.prototype.setBlockSize = function() {
  this.blockSize = this.getSize();
}
Block.prototype.addTransaction = function(transaction) {
  this.transactions.push(transaction);
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
  var size = this.header.getSize() + 2;
  this.transactions.forEach(function(tx) {
    size += tx.getSize();
  });
  return size;
}

function Header() {
  this.version = VERSION;
  this.timestamp = new Date().getTime().toString();
  this.merkleRoot = null;
  this.diffTarget = null;
  this.nonce = null;
}
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

var exports = module.exports = {};
exports.Header = Header;
exports.Block = Block;
