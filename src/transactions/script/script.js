'use script';

const crypto = require('crypto');
const sha256 = crypto.createHash('sha256');
const ripemd160 = crypto.createHash('ripemd160');
const rsa_sha256 = crypto.createVerify('RSA-SHA256');

let OPTS = {
  OP_DUP: 'OP_DUP',
  OP_HASH160: 'OP_HASH160',
  OP_EQUAL: 'OP_EQUAL',
  OP_CHECKSIG: 'OP_CHECKSIG'
};

function Script() {
  this.list = [];
}

Script.prototype.createLockingScript = function(pubKeyHash) {
  this.list.push(OPTS.OP_DUP);
  this.list.push(OPTS.OP_HASH160);
  this.list.push(pubKeyHash);
  this.list.push(OPTS.OP_EQUAL);
  this.list.push(OPTS.OP_CHECKSIG);
}

Script.prototype.createUnlockingScript = function(sig, pubKey) {
  this.list.push(sig);
  this.list.psuh(pubKey);
}

Script.execute = function(unlockingScript, lockingScript) {
  if (unlockingScript == null ||
    lockingScript == null ||
    unlockingScript.length != 2 ||
    lockingScript.length != 5) {
    return false;
  }

  var stack = [];
  stack.push(unlockingScript[0]);
  stack.push(unlockingScript[1]);
  lockingScript.forEach(function(ele) {
    switch (ele) {
      case OPTS.OP_DUP:
        stack.push(stack[stack.length - 1]);
        break;
      case OPTS.OP_HASH160:
        var digest = sha256.update(stack.pop()).digest('hex');
        digest = ripemd160.update(digest).digest('hex')
        stack.push(digest);
        break;
      case OPTS.OP_EQUAL:
        var pubKeyHash1 = stack.pop();
        var pubKeyHash2 = stack.pop();
        if (pubKeyHash1 !== pubKeyHash2) {
          return false;
        }
        break;
      case OPTS.OP_CHECKSIG:
        var pubKey = stack.pop();
        var sig = stack.pop();
        if (!rsa_sha256.verify(pubKey, sig)) {
          return false;
        } else {
          stack.push(true);
        }
        break;
      default:
        stack.push(ele);
        break;
    }
  });
}
