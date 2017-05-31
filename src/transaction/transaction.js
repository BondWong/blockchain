'use strict';

const script = require('./script/script.js');

const VERSION = Buffer.alloc(4);
VERSION.writeUInt32BE(1, 0);
const LOCKTIME = Buffer.alloc(4);
LOCKTIME.writeUInt32BE(10, 0);
const SEQNUM = Buffer.alloc(4);
SEQNUM.writeUInt32BE(1, 0);

function Transaction(version, inputCnt, inputs, outputCnt, outputs, locktime) {
  this.version = version;
  this.inputCnt = inputCnt;
  this.inputs = inputs;
  this.outputCnt = outputCnt;
  this.outputs = outputs;
  this.locktime = locktime;
}
Transaction.prototype.constructor = Transaction;
Transaction.prototype.getSize = function() {
  var size = this.version.length + this.inputCnt.length + this.outputCnt.length + this.locktime.length;
  this.inputs.forEach(function(input) {
    size += input.getSize();
  });
  this.outputs.forEach(function(output) {
    size += output.getSize();
  });
  return size;
}

function Output(amount, lsrpSize, lsrp) {
  this.amount = amount;
  this.lsrpSize = lsrpSize;
  this.lsrp = lsrp;
}
Output.prototype.constructor = Output;
Output.prototype.getSize = function() {
  return this.amount.length + this.lsrpSize.length + this.lsrp.length;
}

function Input(txHash, opIdx, ulsrpSize, ulsrp, seqNum) {
  this.txHash = txHash;
  this.opIdx = opIdx;
  this.ulsrpSize = ulsrpSize;
  this.ulsrp = ulsrp;
  this.seqNum = seqNum;
}
Input.prototype.constructor = Input;
Input.prototype.getSize = function() {
  return this.txHash.length + this.opIdx.length + this.ulsrpSize.length + this.seqNum.length + this.ulsrp.length;
}

function createTransaction(inputs, outputs) {
  const inputCnt = Buffer.alloc(1);
  const outputCnt = Buffer.alloc(1);
  inputCnt.writeUInt8(inputs.length);
  outputCnt.writeUInt8(outputs.length);
  return new Transaction(VERSION, inputCnt, inputs, outputCnt, outputs, LOCKTIME);
}

function createOutput(amt, pubKeyHash) {
  const amount = Buffer.alloc(8);
  amount.writeUInt8(amt, 0);
  const lockingScript = script.createLockingScript(pubKeyHash);
  const lockingScriptSize = Buffer.alloc(1);
  lockingScriptSize.writeUInt8(lockingScript.length, 0);
  var output = new Output(amount, lockingScriptSize, lockingScript);
  return output;
}

function createInput(txHash, outputIndex, sig, pubKey) {
  const unlockingScript = script.createUnlockingScript(sig, pubKey);
  const unlockingScriptSize = Buffer.alloc(1);
  unlockingScriptSize.writeUInt8(unlockingScript.length, 0);
  var input = new Input(txHash, outputIndex, unlockingScriptSize, unlockingScript, SEQNUM);
  return input;
}

var exports = module.exports = {};
exports.createOutput = createOutput;
exports.createInput = createInput;
exports.createTransaction = createTransaction;
