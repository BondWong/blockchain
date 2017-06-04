'use strict';

const script = require('./script/script.js');
const utils = require('../utils/utils.js');

const VERSION = '1';
const LOCKTIME = '1';
const SEQNUM = '1';

function Transaction(version, inputCnt, inputs, outputCnt, outputs, locktime) {
  this.version = version;
  this.inputCnt = inputCnt;
  this.inputs = inputs;
  this.outputCnt = outputCnt;
  this.outputs = outputs;
  this.locktime = locktime;
}
Transaction.prototype.getSize = function() {
  return 4 + this.inputs.length * this.inputs[0].getSize() + this.outputs.length * this.outputs[0].getSize();
}

function Output(amount, size, script) {
  this.amount = amount;
  this.scriptSize = size;
  this.script = script;
}
Output.prototype.getSize = function() {
  return 2 + this.scriptSize;
}

function Input(txHash, opIdx, size, script, seqNum) {
  this.txHash = txHash;
  this.opIdx = opIdx;
  this.scriptSize = size;
  this.script = script;
  this.seqNum = seqNum;
}
Input.prototype.getSize = function() {
  return 2 + this.scriptSize;
}

function createTransaction(inputs, outputs) {
  return new Transaction(VERSION, inputs.length, inputs, outputs.length, outputs, LOCKTIME);
}

function createOutput(amt, pubKeyHash) {
  const lockingScript = script.createLockingScript(pubKeyHash);
  return new Output(amt, lockingScript.getSize(), lockingScript);
}

function createInput(txHash, outputIndex, pvtKey, pubKey) {
  const input = new Input(txHash, outputIndex, 0, null, SEQNUM);
  const inputHash = Buffer.alloc(32, utils.getHash(JSON.stringify(input)), 'hex');
  const unlockingScript = script.createUnlockingScript(inputHash, pvtKey, pubKey);
  return [new Input(txHash, outputIndex, unlockingScript.getSize(), unlockingScript, SEQNUM), inputHash];
}

var exports = module.exports = {};
exports.createOutput = createOutput;
exports.createInput = createInput;
exports.createTransaction = createTransaction;
