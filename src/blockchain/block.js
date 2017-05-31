'use script';

Date.prototype.getUnixTime = function() {
  return this.getTime() / 1000 | 0
};
if (!Date.now) Date.now = function() {
  return new Date();
}
Date.time = function() {
  return Date.now().getUnixTime();
}

const VERSION = Buffer.alloc(4);
VERSION.writeUInt32BE(1, 0);

function Block(header) {
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

function Header(version) {
  this.version = version;
  this.timestamp = Buffer.from(Date.time + '');
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
    this.diffTarget.length + this.nonce.length + this.timestamp;
}
Header.prototype.toString = function(encoding) {
  var buffer = Buffer.concat([this.version, this.timestamp,
    this.preBlockHash, this.merkleRoot, this.timestamp, this.diffTarget, this.nonce
  ], this.getSize());
  return buffer.toString('hex');
}
