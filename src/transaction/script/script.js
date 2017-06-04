'use script';

const crypto = require('crypto');
var secp256k1 = require('secp256k1');

let OPTS = {
  OP_DUP: 'OP_DUP',
  OP_HASH160: 'OP_HASH160',
  OP_EQUAL: 'OP_EQUAL',
  OP_CHECKSIG: 'OP_CHECKSIG'
};

function Script() {
  this.list = [];
}
Script.prototype.constructor = Script;
Script.prototype.getAll = function() {
  return this.list;
}
Script.prototype.get = function(idx) {
  return this.list[idx];
}
Script.prototype.setList = function(list) {
  this.list = list;
  this.length = list.length;
}
Script.prototype.getSize = function() {
  const size = this.list.reduce((acc, ele) => {
    return acc + ele.length
  }, 0);
  return size;
}

function createLockingScript(pubKeyHash) {
  var script = new Script();
  script.setList([OPTS.OP_DUP, OPTS.OP_HASH160,
    pubKeyHash, OPTS.OP_EQUAL, OPTS.OP_CHECKSIG
  ]);
  return script;
}

function createUnlockingScript(inputHash, pvtKey, pubKey) {
  var script = new Script();
  var sig = secp256k1.sign(inputHash, pvtKey);
  script.setList([sig.signature.toString('hex'), pubKey]);
  return script;
}

function execute(msg, unlockingScript, lockingScript) {
  if (unlockingScript === null ||
    lockingScript === null ||
    unlockingScript.length !== 2 ||
    lockingScript.length !== 5) {
    return [false];
  }

  var stack = [];
  stack.push(unlockingScript.get(0));
  stack.push(unlockingScript.get(1));
  lockingScript.getAll().forEach(function(ele) {
    switch (ele.toString()) {
      case OPTS.OP_DUP:
        stack.push(stack[stack.length - 1]);
        break;
      case OPTS.OP_HASH160:
        var digest = crypto.createHash('sha256').update(stack.pop()).digest('hex');
        digest = crypto.createHash('ripemd160').update(digest).digest('hex')
        stack.push(digest);
        break;
      case OPTS.OP_EQUAL:
        var pubKeyHash1 = stack.pop();
        var pubKeyHash2 = stack.pop();
        if (pubKeyHash1 !== pubKeyHash2) {
          return [false];
        }
        break;
      case OPTS.OP_CHECKSIG:
        var pubKey = Buffer.from(stack.pop(), 'hex');
        var sig = Buffer.from(stack.pop(), 'hex');
        if (!secp256k1.verify(msg, sig, pubKey)) {
          return [false];
        } else {
          stack.push(true);
        }
        break;
      default:
        stack.push(ele);
        break;
    }
  });

  return stack;
}

var exports = module.exports = {};
exports.createLockingScript = createLockingScript;
exports.createUnlockingScript = createUnlockingScript;
exports.execute = execute;
