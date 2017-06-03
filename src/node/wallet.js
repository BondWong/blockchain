'use strict';

const express = require('express');
const app = express();
const http = require('http');
const crypto = require('crypto');

const utils = require('../utils/utils.js');

const port = process.env.WALLET_PORT || 3002;
var utxo = [];

app.post('/send/:amount', function(req, res) {
  // assume amount is also valid
  const amount = req.params.amount;
  // create inputs from utxo

  // create outputs

  // create transactions

  // propagate transactions
  res.sendStatus(200);
});

app.post('/receive', function(req, res) {
  // assume amount is also valid
  const transaction = req.body;
  // store outputs

  // respond to changes transaction if any
  res.sendStatus(200);
});

app.listen(port, function() {
  console.log(`wallet starts on port ${port}`);
});
