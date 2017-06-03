'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const bigInt = require('big-integer');
const http = require('http');

const utils = require('../utils/utils.js');
const {
  Block,
  Header
} = require('../block/block.js');

const MAXIMUM = 3;
const BLOCKTIME = 10000; // 10 seconds
const HISTORICALTIMELENGTH = 50; // in reality, it is 2016
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
  restart: function() {
    if (this.request !== null) {
      this.request.abort();
      this.start();
    }
  },
  start: function() {
    block = createBlock();
    diff = calculateDiff();
    // due to the computation power limitation of my computer, it is not able to adjust the target accordingly
    target = calculateTarget();
    // grab transactions from cache without fee bias
    transactionCache.forEach(function(tx) {
      if (block.transactions.length < MAXIMUM && !block.contains(tx)) {
        block.addTransaction(tx);
      }
    });
    // proof of work
    const url = 'http://localhost:8080/POW?target=0x' + target.toString(16);
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
      console.error(`Miner:${port} got error: ${e.message}`);
    });
  },

  done: function(proofOfWork) {
    // update block
    block.header.setDiffTarget(target.toString());
    block.header.setNonce(proofOfWork[0]);
    block.header.hash = proofOfWork[1];
    block.header.duration = proofOfWork[2];
    // append to blockchain
    receiveBlock(utils.getBlockHash(JSON.stringify(block.header)).toString('hex'), block);
  }

};

function calculateDiff() {
  console.log(times);
  if (times.length === HISTORICALTIMELENGTH) {
    const real = times.reduce((acc, val) => {
      return acc + val;
    }, 0);
    const ideal = times.length * BLOCKTIME;
    console.log(ideal);
    console.log(real);
    console.log(ideal / real);
    console.log(parseInt(diff * (ideal / real)));
    // protect from zero
    if (parseInt(diff * (ideal / real)) == 0) {
      return DIFF;
    } else {
      return parseInt(diff * (ideal / real));
    }
  } else {
    return DIFF;
  }
}

function calculateTarget() {
  return bigInt(2).pow(256 - diff);
}

function createBlock() {
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

function receiveBlock(blockHash, block) {
  blockchain.set(blockHash, block);
  // update pre block
  preBlock = block;
  // propagate
  console.log(JSON.stringify(block));
  // clean cache
  block.transactions.forEach(function(tx) {
    const txHash = utils.getTransactionHash(JSON.stringify(tx));
    if (transactionCache.has(txHash)) {
      transactionCache.delete(txHash);
    }
  });
  // update time window
  if (times.length == HISTORICALTIMELENGTH) {
    times.splice(0, 1);
  }
  times.push(parseInt(block.header.duration));
  // abort current round and start a new one
  mining.restart();
}

// add transaction
app.post('/transaction', function(req, res) {
  // assume all transactions are structurally validated
  const transaction = req.body;
  const txHash = utils.getTransactionHash(JSON.stringify(transaction)).toString('hex');
  // assume all transactions are new
  // add to cache
  if (transactionCache.has(txHash)) {
    res.sendStatus(304);
    return;
  }
  transactionCache.set(txHash, transaction);
  // add to block
  if (block.transactions.length < MAXIMUM) {
    block.addTransaction(transaction);
  }
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
  // adding new block to blockchain
  receiveBlock(blockHash, block);
  res.sendStatus(200);
});

app.listen(port, function() {
  console.log(`miner starts on port ${port} and start mining`);
  mining.start();
});
