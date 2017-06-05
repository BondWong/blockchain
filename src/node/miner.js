'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const bigInt = require('big-integer');
const http = require('http');
require('dotenv').config()

const {
  Logger
} = require('../log/logger.js');
const utils = require('../utils/utils.js');
const {
  Block,
  Header
} = require('../block/block.js');

const port = process.argv[2] || 4000;
const name = 'Miner:${port}'
const logger = new Logger(name);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const MAXIMUM = 3;
const BLOCKTIME = 10000; // 10 seconds
const HISTORICALTIMELENGTH = 50; // in reality, it is 2016
const DIFF = 23;

// hard coded but should implement gosip lookup
const network = new Map([
  ['wallets', process.env.WALLETS.split(',')],
  ['miners', process.env.MINERS.split(',')],
  ['fullnodes', process.env.FULLNODES.split(',')]
]);
var txHashSet = new Set();
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
      logger.log('aborts the current round');
      this.request.abort();
      this.start();
    }
  },
  start: function() {
    logger.log('starts a new round');
    block = createBlock();
    diff = calculateDiff();
    // due to the computation power limitation of my computer, it is not able to adjust the target accordingly
    target = calculateTarget();
    logger.log('diff: ' + diff + ' target: ' + target);
    // grab transactions from cache without fee bias
    transactionCache.forEach(function(tx) {
      if (block.transactions.length < MAXIMUM && !block.contains(tx)) {
        block.addTransaction(tx);
      }
    });
    logger.log('transaction size: ' + block.transactions.length);
    logger.log('POW');
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
        error = new Error(`Request Failed.\n` +
          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.\n` +
          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        logger.error(error.message);
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
          logger.error(e.message);
        }
      });
    }).on('error', (e) => {
      logger.error(`got error: ${e.message}`);
    });
  },

  done: function(proofOfWork) {
    logger.log('found solution to POW');
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
  if (times.length === HISTORICALTIMELENGTH) {
    const real = times.reduce((acc, val) => {
      return acc + val;
    }, 0);
    const ideal = times.length * BLOCKTIME;
    // protect from zero
    if (parseInt(diff * (ideal / real)) == 0) {
      return DIFF;
    } else {
      const diff = parseInt(diff * (ideal / real));
      logger.log(`new diff: ${diff}`);
      return diff;
    }
  } else {
    return DIFF;
  }
}

function calculateTarget() {
  const t = bigInt(2).pow(256 - diff);
  logger.log(`new target: ${t.toString()}`)
  return t;
}

function createBlock() {
  var header = new Header();
  var preBlockHash = (typeof preBlock === 'undefined' || preBlock === null) ?
    utils.getBlockHash('Genesis Block') : utils.getBlockHash(JSON.stringify(preBlock));
  header.setPreBlockHash(preBlockHash);
  return new Block(header);
}

function receiveBlock(blockHash, block) {
  logger.log('append new block to blockchain');
  blockchain.set(blockHash, block);
  // update pre block
  preBlock = block;
  // propagate
  logger.log('propagates to the network');
  const body = JSON.stringify(block);
  network.forEach(function(ips) {
    ips.forEach(function(ip) {
      const temp = ip.split(':');
      if (temp[1] === port) {
        return;
      }
      utils.propagate(body, temp[0], parseInt(temp[1]), '/block', logger);
    });
  });
  // clean cache
  logger.log(`clean transaction cache: ${transactionCache.length}`);
  block.transactions.forEach(function(tx) {
    const txHash = utils.getTransactionHash(JSON.stringify(tx));
    if (transactionCache.has(txHash)) {
      transactionCache.delete(txHash);
    }
  });
  logger.log(`cleaned transaction cache: ${transactionCache.length}`);
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
  logger.log('gets a transaction from the network');
  // assume all transactions are structurally validated
  const transaction = req.body;
  const txHash = utils.getTransactionHash(JSON.stringify(transaction)).toString('hex');
  // ignore visited transaction (prevent infinite propagation between network)
  if (txHashSet.has(utils.getTransactionHash(JSON.stringify(transaction)))) {
    logger.log('ignores already contained transaction');
    res.sendStatus(304);
    return;
  }
  txHashSet.add(txHash);
  // add to cache
  if (transactionCache.has(txHash)) {
    logger.log('ignores already contained transaction');
    res.sendStatus(304);
    return;
  }
  logger.log('cache transaction');
  transactionCache.set(txHash, transaction);
  // add to block
  if (block.transactions.length < MAXIMUM) {
    logger.log('add transaction to block');
    block.addTransaction(transaction);
  }
  // propagate to the network
  logger.log('propagates to the network');
  const body = JSON.stringify(transaction);
  network.forEach(function(ips) {
    ips.forEach(function(ip) {
      const temp = ip.split(':');
      if (temp[1] === port) {
        return;
      }
      utils.propagate(body, temp[0], parseInt(temp[1]), '/transaction', logger);
    });
  });
  res.sendStatus(200);
});
// add block
app.post('/block', function(req, res) {
  logger.log('gets a block from the network');
  const block = req.body;
  // assume all blocks are structurally validated
  const blockHash = utils.getBlockHash(JSON.stringify(block.header)).toString('hex');
  if (blockchain.has(blockHash)) {
    logger.log('ignores block that is already appended to blockchain');
    res.sendStatus(304);
    return;
  }
  // validate proof of work
  const hash = bigInt(block.header.hash);
  if (!hash.leq(target)) {
    logger.log('ignores invalid block');
    res.sendStatus(400);
    return;
  }
  // adding new block to blockchain
  receiveBlock(blockHash, block);
  res.sendStatus(200);
});

app.listen(port, function() {
  logger.log('starts');
  mining.start();
});
