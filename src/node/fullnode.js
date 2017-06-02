'use strict';

const express = require('express');
const app = express();
const crypto = require('crypto');

const utils = require('../utils/utils.js');

const port = 3000
var blockchain = new Map();

// add block
app.post('/block', function(req, res) {
  // assume all blocks are structurally validated

  const blockHash = utils.getBlockHash(JSON.stringify(block.header)).toString('hex');
  if (!this.blockchain.has(blockHash)) {
    this.blockchain.set(blockHash, block);
    // to-do: propagate block
  }
});

app.listen(port, function() {
  console.log(`full node starts on port ${port}`);
});
