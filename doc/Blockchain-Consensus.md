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

## The Proof-of-Work Algorithm

The proof-of-work is a proof of a someone has done certain amount of work before it can get reward. It is a very efficient way to verify that someone has done some jobs. In bitcoin system, the work is hashing. To be more specific, during the competition, a miner is hashing the new block header repeatedly by changing just one parameter. You guess it, that parameter is the nonce field in the block header. The miner keeps doing it until the hash result matches a specific target. Whoever finds the hash result first wins the competition. This is the process of mining and as well as how the proof-of-work algorithm works. But what is the specific target and why the verification of proof-of-work is very easy?

### Hash Function

Before we can answer these questions, let's have a basic understanding of hash function. The hash function has a very important role in proof-of-work algorithm, since the work itself is hashing. Hash function takes in a parameter x and gets back a hashed result y. X has arbitrary length while y is of fixed length. The complexity of a hash function is O(n). Bitcoin uses SHA256 as its mining function for the reason that SHA256 has three other important traits:

1. No collision. Well, this is not necessarily true. SHA256 has 2^256 results. So if we do 2^256 + 1 times hashing, there must be a collision. Even worse, according to statistics, the possibility of collision within 2^130 hashing is 99%. So should we give up SHA256? No. Assume we have a computer that can calculate 10,000 hashes per second. It costs this computer 4 * 10^27 years to finish 2^130 hashes. You might not have any ideas about how large the number is. The years of doing hashing is 2 * 10^22 times of the total years of human exist on earth. That means that even if you started doing hashing at the first day we were on earth till now, the possibility of collision is very very small.

2. Irreversible. With SHA256, one can hash x into y but not the other way around. At least it is impossible arithmetically. Unless you create a large table mapping every possible x wish its hashed y.

3. There is no better ways than iteration to locate the range of hashing result. 

### How the Proof-of-Work algorithm works

In the simplest form of proof-of-work algorithm, there are at least a sender and receiver. The sender works very hard to solve a mathematical problem till it finds the solution. And then send the solution to receiver who will verify the answer.

![Alt Text](/images/proof-of-work.png)

Let's look at an example (provided by Andreas Antonopoulos) to get a basic understanding of the mathematical problem that the sender, in our case, the miner, is trying to solve. Assume we have a string of "I am Satoshi Nakamoto" and a nonce started with zero. Our goal is to repeatedly hash the string ended with the nonce by changing the nonce value until we have a result that meets the criteria. The criteria could be anything, but to make this example seems more realistic, let's assume the criteria is a string starts with zero. The following is the output of a program trying to find the result that meets the criteria:

![Alt Text](/images/program.png)

We can see that when nonce equals to 13, we have the solution. In numerical terms, a result starts with zero is a value less than 0x1000000000000000000000000000000000000000000000000000000000000000. In bitcoin, this threshold the target. It is easy to conclude that if we reduce the target, finding the solution will be more difficult. It is also very easy for others to verify that 13 is the solution. A receiver only need to append 13 to its "I am Satoshi Nakamoto" string to verify it. 

Bitcoin's proof-of-work algorithm works pretty much list this one. A miner repeatedly hashes the new block header by changing the nonce field of the header until the result is smaller than the target. There are still missing pieces. How is the target set? Checking the source codes, we can find out that the target is defined by such equation: `target = 2^(256 - difficulty)`. That leas us to another question. How the difficulty is set? 

In bitcoin, the difficulty is the difficulty target field in a bitcoin header. It is a dynamic value that is adjusted accordingly by a miner. Every miner adjusts their own difficulty independently based on the same principle -- a new block will be mined every 10 minutes on average in the bitcoin network. The adjustment happens after 2,016 blocks are mined, using the following equation. `New Difficulty = Old Difficulty * (Actual Time of Last 2016 Blocks / 20160 minutes)`. 20160 minutes is an ideal situation where the total time needed to mine 2016 blocks. By comparing with 20160 minutes, the difficulty is adjusted accordingly (If the mining is faster than 10 minutes, the difficulty increases, resulting in the reduce of the target. If it is slower, the difficulty decreases, resulting in the increase of the target). 

Now, we have a clear picture of the mining process. A miner constructs the new block header and fills the fields, including the difficulty target filed, which is calculated according to the history data. Meanwhile, it is also receiving, validating transactions. With new transactions accepted, it updates the merkle tree root filed in the block header. There is one more thing that the miner is doing at the same time, mining. The miner hashes the new block header repeatedly by changing the nonce filed's value until it gets a result that smaller than the target, which is also calculated by the miner using the difficulty target field it calculated previously. With the arrival of a new block, the miner knows it has lost the competition and starts the mining all over again. However, if the miner finds the solution first, it propagates the new block to the bitcoin network, which contains the difficulty and nonce, allowing other nodes to easily verify that this miner has correctly found a solution by hashing the block and comparing with the target. The next thing is to happen is validating this newly received block.

## Independent New Block Verification by Every Node

As the newly mined block propagated to the network, each node verify the block based on a [checklist](https://en.bitcoin.it/wiki/Protocol_rules#.22block.22_messages). The independent verification of new blocks ensures that the miners can't cheat. Any wrong doing invalidates the block. 

## Independent Selection of Chain With Most Cumulative Computation Effort by Every Node


