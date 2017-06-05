'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config()

const {
  RequestManager
} = require('../utils/request-manager.js');
const {
  Logger
} = require('../log/logger.js');
const utils = require('../utils/utils.js');

const port = process.argv[2] || 5000;
const name = `FULLNODE:${port}`;
const logger = new Logger(name);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// hard coded but should implement gosip lookup
const network = new Map([
  ['wallets', process.env.WALLETS.split(',')],
  ['miners', process.env.MINERS.split(',')],
  ['fullnodes', process.env.FULLNODES.split(',')]
]);
var txHashSet = new Set();
var blockchain = new Map();
const propagationManager = new RequestManager();

// add block
app.post('/block', function(req, res) {
  logger.log('gets a block from the network');
  const block = req.body;
  // assume all blocks are structurally validated
  const blockHash = utils.getBlockHash(JSON.stringify(block.header)).toString('hex');
  if (blockchain.has(blockHash)) {
    logger.log('ignores already contained block');
    res.sendStatus(304);
    return;
  }
  // append to blockchain
  blockchain.set(blockHash, block);
  // propagate to the network
  logger.log('propagates to the network');
  const body = JSON.stringify(block);
  network.forEach(function(ips) {
    ips.forEach(function(ip) {
      const temp = ip.split(':');
      if (temp[1] === port) {
        return;
      }
      const msg = `Block ${blockHash} propagates to ${temp[0]}:${temp[1]}`;
      const req = utils.propagate(body, temp[0], parseInt(temp[1]), '/block', logger, msg);
      propagationManager.append(req);
    });
  });
  res.sendStatus(200);
});
// add transaction
app.post('/transaction', function(req, res) {
  // assume all transactions are structurally validated
  const transaction = req.body;
  const txHash = utils.getTransactionHash(JSON.stringify(transaction));
  // ignore visited transaction (prevent infinite propagation between network)
  if (txHashSet.has(utils.getTransactionHash(JSON.stringify(transaction)))) {
    res.sendStatus(304);
    return;
  }
  txHashSet.add(txHash);
  // propagate to the network
  const body = JSON.stringify(transaction);
  network.forEach(function(ips) {
    ips.forEach(function(ip) {
      const temp = ip.split(':');
      if (temp[1] === port) {
        return;
      }
      const msg = `Transaction ${txHash} propagates to ${temp[0]}:${temp[1]}`;
      const req = utils.propagate(body, temp[0], parseInt(temp[1]), '/transaction', logger, msg);
      propagationManager.append(req);
    });
  });
  res.sendStatus(200);
});

app.get('/blockchain', function(req, res) {
  var blocks = [];
  blockchain.forEach(function(block) {
    blocks.push(block);
  });

  res.send(JSON.stringify(blocks));
});

app.get('/block/:hash', function(req, res) {
  console.log(req.params);
  const hash = req.params.hash;
  const block = blockchain[hash];
  res.send(JSON.stringify(block));
});

app.listen(port, function() {
  logger.log('starts');
});
