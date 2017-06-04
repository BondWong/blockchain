'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const crypto = require('crypto');

const utils = require('../utils/utils.js');
const tx = require('../transaction/transaction.js');
const script = require('../transaction/script/script.js');

const port = process.env.WALLET_PORT || 3002;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var utxos = []; // outputs with reference to the transaction and its index in the transaction
var keyPair = utils.generateKeys();
var pvtKey = keyPair[0];
var pubKey = keyPair[1];
var pubKeyHash = utils.generatePubKeyHash(pubKey);

function createInputs(amount) {
  utxos.sort(function(a, b) {
    return -(a.amount - b.amount);
  });
  var inputs = [];
  var remains = [];
  var total = 0;
  utxos.forEach(function(utxo) {
    if (amount === 0) {
      remains.push(utxo);
      return;
    } else {
      // sign
      const temp = utxo.transaction;
      utxo.transaction = null; // remove reference circle
      const txHash = utils.getTransactionHash(JSON.stringify(temp));
      utxo.transaction = temp;
      const opIdx = utxo.opIndex;
      const tuple = tx.createInput(txHash, opIdx, pvtKey, pubKey.toString('hex'));
      const input = tuple[0];
      const inputHash = tuple[1];
      // unlock
      if (script.execute(inputHash, input.script, utxo.script)[0]) {
        inputs.push(input);
        amount = amount < utxo.amount ? 0 : amount - utxo.amount;
        total += utxo.amount;
      }
    }
  });
  utxos = remains;
  return [inputs, total];
}

function createOutputs(totalAmount, amount, recPubKeyHash, pubKeyHash) {
  const output1 = tx.createOutput(amount, recPubKeyHash);
  if (totalAmount > amount) {
    const output2 = tx.createOutput(totalAmount - amount, pubKeyHash);
    return [output1, output2];
  } else {
    return [output1];
  }
}

function createTransaction(inputs, outputs) {
  return tx.createTransaction(inputs, outputs);
}

app.post('/send/:amount/:recPubKeyHash', function(req, res) {
  // assume amount is also valid: number and larger than zero
  const amount = req.params.amount;
  const recPubKeyHash = req.params.recPubKeyHash; // pubKeyHash of the receiver

  // create inputs from utxo
  const result = createInputs(amount);
  const inputs = result[0];
  const totalAmount = result[1];

  // create outputs
  const outputs = createOutputs(totalAmount, amount, recPubKeyHash, pubKeyHash);

  // create transaction
  const transaction = createTransaction(inputs, outputs);

  // propagate transactions
  console.log(JSON.stringify(transaction));
  res.sendStatus(200);
});

app.post('/transaction', function(req, res) {
  const transaction = req.body;
  // store outputs
  transaction.outputs.forEach(function(output, index) {
    if (output.script.list[2] === pubKeyHash) {
      const utxo = tx.createOutput(output.amount, pubKeyHash);
      utxo.transaction = transaction;
      utxo.opIndex = index;
      utxos.push(utxo);
    }
  });
  res.sendStatus(200);
});

app.listen(port, function() {
  console.log(`wallet starts on port ${port} with pubKeyHash ${pubKeyHash}`);
});