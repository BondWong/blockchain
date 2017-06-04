'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config()

const utils = require('../utils/utils.js');

const port = process.argv[2] || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// hard coded but should implement gosip lookup
const network = {
  wallets: process.env.WALLETS.split(','),
  miners: process.env.MINERS.split(','),
  fullnodes: process.env.FULLNODES.split(',')
};
var txHashSet = new Set();
var blockchain = new Map();

// add block
app.post('/block', function(req, res) {
  const block = req.body;
  // assume all blocks are structurally validated
  const blockHash = utils.getBlockHash(JSON.stringify(block.header)).toString('hex');
  if (blockchain.has(blockHash)) {
    res.sendStatus(304);
    return;
  }
  // append to blockchain
  blockchain.set(blockHash, block);
  // propagate to the network
  res.sendStatus(200);
});
// add transaction
app.post('/transaction', function(req, res) {
  // assume all transactions are structurally validated
  const transaction = req.body;
  const txHash = utils.getTransactionHash(JSON.stringify(transaction)).toString('hex');
  // ignore visited transaction (prevent infinite propagation between network)
  if (txHashSet.has(utils.getTransactionHash(JSON.stringify(transaction)))) {
    res.sendStatus(304);
    return;
  }
  txHashSet.add(txHash);
  // propagate to the network
  res.sendStatus(200);
});

app.listen(port, function() {
  console.log(`full node starts on port ${port}`);
  console.log(network);
});
