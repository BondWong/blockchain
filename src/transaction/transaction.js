'use strict';

function Transaction(version, inputCnt, inputs, outputCnt, outputs, locktime) {
  Bufferable.call(this);
  this.version = version;
  this.inputCnt = inputCnt;
  this.inputs = inputs;
  this.outputCnt = outputCnt;
  this.outputs = outputs;
  this.locktime = locktime;
}
Transaction.prototype = Object.create(Bufferable.prototype);
Transaction.prototype.constructor = Transaction;

function Output(amount, lsrpSize, lsrp) {
  this.amount = amount;
  this.lsrpSize = lsrpSize;
  this.lsrp = lsrp;
}
Output.prototype = Object.create(Bufferable.prototype);
Output.prototype.constructor = Output;

function Input(txHash, opIdx, ulsrpSize, ulsrp, seqNum) {
  this.txHash = txHash;
  this.opIdx = opIdx;
  this.ulsrpSize = ulsrpSize;
  this.ulsrp = ulsrp;
  this.seqNum = seqNum;
}
Input.prototype = Object.create(Bufferable.prototype);
Input.prototype.constructor = Input;
