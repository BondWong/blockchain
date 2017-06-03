'use strict';

const crypto = require('crypto');
var merkle = require('merkle-lib');
var merkleProof = require('merkle-lib/proof');
var bigInt = require('big-integer');
var http = require('http');

const utils = require('../utils/utils.js');
const {
  Block,
  Header
} = require('../block/block.js');

const MAXIMUM = 3;
const BLOCKTIME = 10000; // 1 minute
const HISTORICALTIMELENGTH = 100; // in reality, it is 2016

function Miner(ip, port) {
  this.blockchain = new Map();
  this.preBlock;
  this.block;
  this.transactionCache = new Map();
  this.diff = 23;
  this.times = [];
  this.nonce = bigInt();
  this.target = bigInt(2).pow(256 - this.diff);
  this.merkleTree = null;
}
Miner.prototype.addBlock = function(block, startNextRound = true) {
  // assume all blocks are structurally validated
  const blockHash = utils.getBlockHash(block.header.toBuffer().toString('hex')).toString('hex');
  if (!this.blockchain.has(blockHash)) {
    // verify solution
    const hash = bigInt(block.header.hash.toString());
    if (hash.leq(this.target)) {
      this.blockchain.set(blockHash, block);
      // to-do: propagate block
      // stop this round
      if (typeof this.request !== 'undefined' || this.request != null) {
        this.request.abort();
      }
      // clean cache
      var _this = this;
      block.getTransactions().forEach(function(tx) {
        const txHash = utils.getTransactionHash(tx.toBuffer().toString('hex'));
        if (_this.transactionCache.has(txHash)) {
          _this.transactionCache.delete(txHash);
        }
      });
      // start next round
      if (startNextRound) {
        this.mine();
      }

      return true;
    }
  }

  return false;
}
Miner.prototype.addTransaction = function(transaction) {
  // assume all transactions are structurally validated
  const tx = transaction.toBuffer().toString('hex');
  const txHash = utils.getTransactionHash(tx).toString('hex');
  if (!this.transactionCache.has(txHash)) {
    this.transactionCache.set(txHash, transaction);
    // create if not exist
    this.createBlock();
    // add if has space and not includes
    this.addTransactionToBlock(transaction, txHash);
  }
}
Miner.prototype.mine = function(done) {
  this.merkleTree = null;
  this.block = null;
  if (this.times.length !== 0) {
    const real = this.times.reduce((acc, val) => {
      return acc + val;
    }, 0);
    const ideal = this.times.length * 10000;
    this.diff = parseInt(this.diff * real / ideal);
  }
  // create if not exist
  this.createBlock();
  // add if has space and not includes
  const _this = this;
  this.transactionCache.forEach(function(tx) {
    _this.addTransactionToBlock(tx);
  });

  // proof of work
  const url = 'http://localhost:8080/POW?target=0x' + this.target.toString(16);
  this.request = http.get(url, (res) => {
    const {
      statusCode
    } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => {
      rawData += chunk;
    });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        _this.foundSolution(parsedData);
        if (done) {
          done();
        }
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
}
Miner.prototype.foundSolution = function(solution) {
  console.log(solution);
  this.block.header.setDiffTarget(Buffer.from(this.target.toString(16)));
  this.block.header.setNonce(Buffer.from(solution[0]));
  if (this.times.length == HISTORICALTIMELENGTH) {
    this.times.pop();
  }
  this.times.push(parseInt(solution[1]));
  // propagate
}
Miner.prototype.createBlock = function() {
  if (typeof this.block === 'undefined' || this.block === null) {
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
}
Miner.prototype.addTransactionToBlock = function(transaction, txHash) {
  // no transaction fee bias
  if (this.block.getTxCnt() < MAXIMUM) {
    if (this.merkleTree === null) {
      this.block.addTransaction(transaction);
      const txHashes = [];
      this.block.getTransactions().forEach(function(ele) {
        txHashes.push(Buffer.from(utils.getTransactionHash(ele.toBuffer().toString('hex'))));
      });
      this.merkleTree = merkle(txHashes, sha256);
      this.block.header.setMerkleRoot(Buffer.from(this.merkleTree[this.merkleTree.length - 1]));
    } else {
      if (typeof txHash === 'undefined' || txHash === null) {
        const tx = transaction.toBuffer().toString('hex');
        const txHash = utils.getTransactionHash(tx).toString('hex');
      }
      const proof = merkleProof(this.merkleTree, txHash);
      if (proof === null) {
        this.block.addTransaction(transaction);
        const txHashes = [];
        this.block.getTransactions().forEach(function(ele) {
          txHashes.push(Buffer.from(utils.getTransactionHash(ele.toBuffer().toString('hex'))));
        });
        this.merkleTree = merkle(txHashes, sha256);
        this.block.header.setMerkleRoot(Buffer.from(this.merkleTree[this.merkleTree.length - 1]));
      }
    }
  }
}

function Wallet(address) {
  this.address = address;
  this.uxto = [];
}


var exports = module.exports = {};
