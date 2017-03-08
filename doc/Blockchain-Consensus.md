# Bitcoin and Blockchain part V: The Blockchain Consensus

To some degree, we can think of bitcoin as a decentralized public ledger that records every valid transaction. The ledger is called the blockchain. Transactions that made their ways to the blockchain are confirmed and will remain unchanged forever. From last part, we know that during the propagation, a transaction will be put into a block first. So how a block is added to the blockchain? I will talk about this interesting topic in this part.

## Simplified Blockchain Consensus

The consensus process involves a special kind of bitcoin node -- the miner. For now, you can think of a miner of a special bitcoin node that has the ability to add block to the blockchain. The process of adding a new block to the blockchain is called mining, which happens every 10 minutes approximately. 

As other full nodes, a miner validate new transactions and add them to the new block it creates. Meanwhile, it competes with other miners by solving the proof-of-work algorithm. Miner that wins the competition has the right to add its block to the blockchain, earning itself transaction fees (difference between transaction inputs and outputs) from all the transaction contained in the block and mining fee for adding new block to the blockcain. 

The mining process is also the money supply of the bitcoin system. It started with 50 bitcoins per block and halved by half after every 210,000 blocks are mined until the reward reduces to zero [satoshi](https://en.bitcoin.it/wiki/Satoshi_(unit) (1 bitcoin = 100,000,000 satoshi). The rewarding system attracts more miners and encourages them to compete with each others, increasing the computation power to the bitcoin network. The increasing computation power makes it harder and harder to attack the system. It is impossible for an individual attacker to attack the current bitcoin system since it would cost him/her so much to win the competition before doing any harm. An individual or a group must have over [51% of the computation power](http://bitcoin.stackexchange.com/questions/658/what-can-an-attacker-with-51-of-hash-power-do) to fail the system, which is very unlikely to happen.

## The Four Processes
According to [Andreas Antonopoulos](https://antonopoulos.com/), bitcoin's decentrailized consensus emerges from the independently occur of the following four processes: 

1. Independent transactions verification by full nodes
2. Independent new block mining by miners
3. Independent new block verification by every node
4. Independent selection of chain with most cumulative computation effort by every node

Let's exam these processes one by one. 

## Independent Transaction Verification by Full Nodes

A transaction is created when by collecting UTXO, providing unlocking script and constructing new outputs assigned to new owner. The transaction will then be forward to peers of the node creates it. Before forwarding the transaction further, the peer nodes will verify the transaction independently so that invalid transaction will not be propagated. Invalid transaction can be those that uses wrong unlocking script or larger output than input, etc. You can find the whole checklist [here](https://en.bitcoin.it/wiki/Protocol_rules#.22tx.22_messages). 

## Independent New Block Mining by Miners

Miners compete with other miners to gain the right to add a new block to the blockchain, earning mining reward and transaction fee. The winner will sends the new block to the network, announcing the end of the current competition and the beginning of the next. That means when a miner receives a new block, it will stop competing and start a new one. 

During a competition, a miner mainly does three things. Validating transactions and maintaining them in transaction pool in memory, constructing and updating the block header of the new block, and competing with each other to win the editing right. 

A miner validating transactions while competing with each other. After validating transactions, a miner will add them to transaction pool in memory, collecting transactions to prepare for adding the new block if the miner wins. Whenever it receives a new block, it will check all the transaction in the pool and remove those contained in the new block. Whatever transactions remain in the pool will be added to a new block created by the miner. 

In order to get the reward and transaction fee, a miner will create a special transaction called generation transaction. Unlike a standard transaction, it does not need UTXO as inputs. Its has only one input called coinbase, creating bitcoin from nothing. The output assigns the bitcoins (mining reward + transaction fee) to the miner's address. 

The miner also construct the block header, filing the following fields:

Size | Field | Description
---- | ----- | -----------
4 bytes | Version | Version of protocol used by a block
32 bytes | Previous Block Hash | A reference to the previous block
32 bytes | Merkle Root | The root of merkle tree
4 bytes | Timestamp | The creation time of the block
4 bytes | Difficulty Target | The proof-of-work algorithm difficulty target for this block
4 bytes | Nonce | The only changing parameter used in the proof-of-work algorithm

We've talked about the block header in [the previous part](/doc/Blockchain.md ), where we covered all the fields except difficulty target and nonce. They will be covered shortly when we dive into the proof-of-work algorithm. 

Filing version field and timestamp filed are trivial. Filing others require some calculation. The previous block hash is the result of hash algorithm applied to the previous block's header. Next is the merkle root, the whole tree is constructed with transactions that are included in this block. You can go back to previous part to review the merkle tree construction. Note that this filed is undated frequently since the miner is validating incoming transactions before the block is mined. The difficulty target is a dynamic field whose value is based on the whole network. We will talk about this shortly. The nonce field is initialized to zero. However, it will be changed to different value by a miner during a competition. We will also look at it closer later. 

With all the fields ready, the miner begins fierce competition to mine a new block. Next, let's take a close look at the competition.

## The Proof-Of-Work Algorithm


