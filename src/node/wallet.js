'use strict';

const express = require('express');
const app = express();
const http = require('http');
const crypto = require('crypto');

const utils = require('../utils/utils.js');
const tx = require('../src/transaction/transaction.js');
const script = require('../src/transaction/script/script.js');

const port = process.env.WALLET_PORT || 3002;
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
      const txHash = utils.getTransactionHash(JSON.stringify(utxo.transaction));
      const opIdx = utxo.opIndex;
      const input = tx.createInput(txHash, opIdx, pvtKey, pubKey.toString('hex'));
      // unlock
      if (script.execute(input.script, utxo.script)[0]) {
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

function createTransactions(inputs, outputs) {
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

  // create output
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
    if (output.pubKeyHash === pubKeyHash) {
      utxo.transaction = transaction;
      utxo.opIndex = index;
      utxos.push(output);
    }
  });
  // respond to changes transaction if any
  res.sendStatus(200);
});

app.listen(port, function() {
  console.log(`wallet starts on port ${port}`);
});
