'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
var merkle = require('merkle-lib');
var merkleProof = require('merkle-lib/proof');
var bigInt = require('big-integer');
var http = require('http');

const utils = require('../utils/utils.js');

const MAXIMUM = 3;
const BLOCKTIME = 10000; // 1 minute
const HISTORICALTIMELENGTH = 100; // in reality, it is 2016
const DIFF = 23;

const port = process.env.MINER_PORT || 3001;
var blockchain = new Map();
var transactionCache = new Map();
var preBlock = null;
var block = null;
var diff = DIFF;
var times = [];
var nonce = bigInt();
var target = bigInt(2).pow(256 - diff);
var merkleTree = null;
var mining = {
  request: null,
  abort: function() {
    if (this.request !== null) {
      this.request.abort();
    }
  },
  start: function() {
    merkleTree = null;
    block = this.createBlock();
    diff = this.calculateDiff();

  }

  contains: function() {
    
  }

  calculateDiff: function() {
    if (times.length !== 0) {
      const real = times.reduce((acc, val) => {
        return acc + val;
      }, 0);
      const ideal = times.length * BLOCKTIME;
      return parseInt(diff * real / ideal);
    } else {
      return DIFF;
    }
  }

  creaeBlock: function() {
    var header = new Header();
    var preBlockHash = (typeof preBlock === 'undefined' || preBlock === null) ?
      utils.getBlockHash('Genesis Block') : utils.getBlockHash(JSON.stringify(preBlock));
    header.setPreBlockHash(preBlockHash);
    return new Block(header);
  }
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// add transaction
app.post('/transaction', function(req, res) {
  res.sendStatus(200);
});
// add block
app.post('/block', function(req, res) {
  const block = req.body;
  // assume all blocks are structurally validated
  const blockHash = utils.getBlockHash(JSON.stringify(block.header)).toString('hex');
  if (blockchain.has(blockHash)) {
    res.sendStatus(304);
    return;
  }
  // validate proof of work
  const hash = bigInt(block.header.hash);
  if (!hash.leq(target)) {
    res.sendStatus(400);
    return;
  }
  // append to blockchain
  blockchain.set(blockHash, block);
  // propagate
  // clean cache
  block.transactions.forEach(function(tx) {
    const txHash = utils.getTransactionHash(JSON.stringify(tx));
    if (transactionCache.has(txHash)) {
      transactionCache.delete(txHash);
    }
  });
  // stop the current round
  mining.abort();
  // start next round
  mining.start();
  res.sendStatus(200);
});

app.listen(port, function() {
  console.log(`miner starts on port ${port} and start mining`);
  mining.start();
});
