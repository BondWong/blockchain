'use strict';

function Input(txHash, opIdx, ulsrpSize, ulsrp, seqNum) {
  this.txHash = txHash;
  this.opIdx = opIdx;
  this.ulsrpSize = ulsrpSize;
  this.ulsrp = ulsrp;
  this.seqNum = seqNum;
}
