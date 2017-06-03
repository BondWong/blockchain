'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
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
var mining = {
  request: null,
  abort: function() {
    if (this.request !== null) {
      this.request.abort();
    }
  },
  start: function() {
    block = createBlock();
    diff = calculateDiff();
    // grab transactions from cache without fee bias
    transactionCache.forEach(function(tx) {
      if (block.transactions.length < MAXIMUM && !block.contains(tx)) {
        block.appendTransaction(tx);
      }
    });
    // proof of work
    const url = 'http://localhost:8080/POW?target=0x' + this.target.toString(16);
    var _this = this;
    this.request = http.get(url, (res) => {
      const {
        statusCode
      } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error(`Miner:${port} Request Failed.\n` +
          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Miner:${port} Invalid content-type.\n` +
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
          _this.done(parsedData);
        } catch (e) {
          console.error(e.message);
        }
      });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
  },

  done: function(proofOfWork) {
    // update block
    block.header.setDiffTarget(target.toString());
    block.header.setNonce(proofOfWork[0]);
    block.header.hash = proofOfWork[0];

    // append to blockchain
    const blockHash = utils.getBlockHash(JSON.stringify(block.header)).toString('hex');
    blockchain.set(blockHash, block);
    // propagate

    // update time window
    if (times.length == HISTORICALTIMELENGTH) {
      times.pop();
    }
    times.push(parseInt(solution[1]));
  }

};

function calculateDiff() {
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

function creaeBlock() {
  var header = new Header();
  var preBlockHash = (typeof preBlock === 'undefined' || preBlock === null) ?
    utils.getBlockHash('Genesis Block') : utils.getBlockHash(JSON.stringify(preBlock));
  header.setPreBlockHash(preBlockHash);
  return new Block(header);
}

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
