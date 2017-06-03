'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');

const utils = require('../utils/utils.js');

const port = process.env.FULLNODE_PORT || 3000;
var blockchain = new Map();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

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
  // to-do: propagate block
  res.sendStatus(200);
});

app.listen(port, function() {
  console.log(`full node starts on port ${port}`);
});
