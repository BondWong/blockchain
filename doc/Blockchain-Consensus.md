# Bitcoin and Blockchain part V: The Blockchain Consensus

To some degree, we can think of bitcoin as a decentralized public ledger that records every valid transaction. The ledger is called the blockchain. Transactions that made their ways to the blockchain are confirmed and will remain unchanged forever. From last part, we know that during the propagation, a transaction will be put into a block first. So how a block is added to the blockchain? I will talk about this interesting topic in this part.

## Simplified Blockchain Consensus

The consensus process involves a special kind of bitcoin node -- the miner. For now, you can think of a miner as a special bitcoin node that has the ability to add blocks to the blockchain. The process of adding a new block to the blockchain is called mining, which happens every 10 minutes approximately. 

A miner validates new transactions and adds them to the new block it creates. Meanwhile, it competes with other miners by solving the proof-of-work algorithm. The miner wins the competition has the right to add its block to the blockchain, earning itself transaction fees (the difference between transaction inputs and outputs) from all the transaction contained in the block and mining fee for adding a new block to the blockcain. 

The mining process is also the money supply of the bitcoin system. It starts with 50 bitcoins per block and halves after every 210,000 blocks are mined until the reward reduces to zero [satoshi](https://en.bitcoin.it/wiki/Satoshi_(unit) (1 bitcoin = 100,000,000 satoshi). The rewarding system attracts more miners and encourages them to compete with each other, increasing the computation power to the bitcoin network. The increasing computation power makes it harder and harder for anyone to attack the system. It is impossible for an individual attacker to attack the current bitcoin system since it would cost him/her so much to win the competition before doing any harm. An individual or a group must have over [51% of the computation power](http://bitcoin.stackexchange.com/questions/658/what-can-an-attacker-with-51-of-hash-power-do) to fail the system, which is very unlikely to happen.

## The Four Processes
According to [Andreas Antonopoulos](https://antonopoulos.com/), bitcoin's decentralized consensus emerges from the following four processes occuring independently.

1. Independent transactions verification by full nodes
2. Independent new block mining by miners
3. Independent new block verification by every node
4. Independent selection of chain with most cumulative computation effort by every node

Let's exam these processes one by one. 

## Independent Transaction Verification by Full Nodes

A transaction is created when by collecting UTXO, providing the unlocking script and constructing new outputs assigned to the new owner. The transaction will then be forwarded to peers of the node that creates it. Before forwarding the transaction further, the peer nodes will verify the transaction independently so that invalid transaction will not be propagated. Invalid transactions can be those that uses wrong the unlocking script or larger output than input, etc. You can find the whole checklist [here](https://en.bitcoin.it/wiki/Protocol_rules#.22tx.22_messages). 

## Independent New Block Mining by Miners

Miners compete with other miners to gain the right to add a new block to the blockchain, earning mining reward and transaction fee. The winner will send his new block to the network, announcing the end of the current competition and the beginning of the next. That means when a miner receives a new block, it will stop competing and start a new one. 

During a competition, a miner mainly does three things. Validating transactions and maintaining them in the transaction pool in memory, constructing and updating the block header of the new block, and competing with each other to win the right to edit. 

Miners are validating transactions while competing with each other. After validating transactions, a miner will add them to the transaction pool in memory, collecting transactions to prepare for adding the new block if the miner wins. Whenever it receives a new block, it will check all transactions in the pool and remove those contained in the new block. Whatever transactions remain in the pool will be added to a new block created by the miner. 

In order to get the reward and transaction fee, a miner will create a special transaction called a generation transaction. Unlike a standard transaction, it does not need UTXO as inputs. Its has only one input called the coinbase, which creates bitcoins from nothing. The output assigns the bitcoins (mining reward + transaction fee) to the miner's address. 

The miner also constructs the block header, filling the following fields:

Size | Field | Description
---- | ----- | -----------
4 bytes | Version | Version of protocol used by a block
32 bytes | Previous Block Hash | A reference to the previous block
32 bytes | Merkle Root | The root of merkle tree
4 bytes | Timestamp | The creation time of the block
4 bytes | Difficulty Target | The proof-of-work algorithm difficulty target for this block
4 bytes | Nonce | The only changing parameter used in the proof-of-work algorithm

We've talked about the block header in [the previous part](/doc/Blockchain.md ), where we covered all the fields except the difficulty target and nonce. They will be covered shortly when we dive into the proof-of-work algorithm. 

Filing version field and timestamp field are trivial. Filing others require some calculation. The previous block hash is the result of the hash algorithm applied to the previous block's header. Next is the merkle root. The whole tree is constructed with transactions that are included in this block. You can go back to the previous part to review the merkle tree construction. Note that this field is undated every time there is a new transaction that is added to the new block. The difficulty target is a dynamic field whose value is based on the whole network. We will talk about this shortly. The nonce field is initialized to zero. However, it will be changed to a different value by a miner during the competition. We will also look at it closer later. 

With all the fields ready, the miner begins the fierce competition to mine a new block. Next, let's take a close look at the competition.

## The Proof-of-Work Algorithm

The proof-of-work is a proof that someone has done a certain amount of work before it can get a reward. It is a very efficient way to verify that someone has done some jobs. In the bitcoin system, the work is hashing. To be more specific, during the competition, a miner is hashing the new block header repeatedly by changing just one parameter. You guess it, that parameter is the nonce field in the block header. The miner keeps doing it until the hash result matches a specific target. Whoever finds the hash result first wins the competition. This is the process of mining and it is also how the proof-of-work algorithm works. But what is the specific target and why is the verification of proof-of-work very easy?

### Hash Function

Before we can answer these questions, let's have a basic understanding of the hash function. The hash function has a very important role in the proof-of-work algorithm, since the work itself is hashing. A hash function takes in a parameter x and gets back a hashed result y. X has arbitrary length while y is of fixed length. The complexity of a hash function is O(n). Bitcoin uses SHA256 as its mining function for the reason that SHA256 has three other important traits:

1. No collision. Well, this is not necessarily true. SHA256 has 2^256 results. So if we hash 2^256 + 1 times, there must be a collision. Even worse, according to statistics, the possibility of collision within 2^130 times of hashing is 99%. So should we give up SHA256? No. Assume we have a computer that can calculate 10,000 hashes per second. It costs this computer 4 * 10^27 years to finish 2^130 hashes. You might not have any idea about how large this number is. The number of years of doing hashing is 2 * 10^22 times of that of human exist on earth. That means that even if you started doing hashing since the first day we were on earth till now, the possibility of collision is still very very small.

2. Irreversible. With SHA256, one can hash x into y but not the other way around. At least it is impossible arithmetically. Unless you create a large table mapping every possible x with its hashed y.

3. There are no better ways than iteration to locate the range of the hashing result. 

### How the Proof-of-Work algorithm works

In the simplest form of the proof-of-work algorithm, there are at least a sender and receiver. The sender works very hard to solve a mathematical problem till it finds the solution, and then sends the solution to the receiver who will verify the answer.

![Alt Text](/images/proof-of-work.png)

Let's look at an example (provided by Andreas Antonopoulos) to get a basic understanding of the mathematical problem that the sender, in our case, the miner, is trying to solve. Assume we have a string of "I am Satoshi Nakamoto" and a nonce started with zero. Our goal is to repeatedly hash the string ended with the nonce by changing the nonce value until we have a result that meets the criteria. The criteria could be anything, but to make this example seems more realistic, let's assume the criteria is a string starts with zero. The following is the output of a program trying to find the result that meets the criteria:

![Alt Text](/images/program.png)

We can see that when the nonce equals to 13, we have the solution. In numerical terms, a result starts with zero is a value less than 0x1000000000000000000000000000000000000000000000000000000000000000. In bitcoin, this threshold is the target. It is easy to conclude that if we reduce the target, finding the solution will be more difficult. It is also very easy for others to verify that 13 is the solution. A receiver only needs to append 13 to its "I am Satoshi Nakamoto" string to verify it. Easy, right?

Bitcoin's proof-of-work algorithm works pretty much like this one. A miner repeatedly hashes the new block header by changing the nonce field of the header until the result is smaller than the target. There are still missing pieces. How is the target set? Checking the source codes, we can find out that the target is defined by such equation: `target = 2^(256 - difficulty)`. That leads us to another question. How is the difficulty set? 

In bitcoin, the difficulty is the difficulty target field in a bitcoin header. It is a dynamic value that is adjusted accordingly by a miner. Every miner adjusts their own difficulty independently based on the same principle -- a new block will be mined every 10 minutes on average in the bitcoin network. The adjustment happens after 2,016 blocks are mined, using the following equation. `New Difficulty = Old Difficulty * (Actual Time of Last 2016 Blocks / 20160 minutes)`. 20160 minutes is an ideal situation for the total time needed to mine 2016 blocks. By comparing with 20160 minutes, the difficulty is adjusted accordingly (If the mining is faster than 10 minutes, the difficulty increases, resulting in the reduction of the target. If it is slower, the difficulty decreases, resulting in the increase of the target). 

Now, we have a clear picture of the mining process. A miner constructs the new block header and fills the fields, including the difficulty target field, which is calculated according to the history data. Meanwhile, it is also receiving, validating transactions. With new transactions accepted, it updates the merkle tree root field in the block header. There is one more thing that the miner is doing at the same time, mining. The miner hashes the new block header repeatedly by changing the nonce filed's value until it gets a result that is smaller than the target, which is also calculated by the miner using the difficulty target field it calculated previously. With the arrival of a new block, the miner knows it has lost the competition and starts the mining all over again. However, if the miner finds the solution first, it propagates the new block to the bitcoin network, which contains the difficulty and nonce, allowing other nodes to easily verify that this miner has correctly found a solution by hashing the block and comparing with the target. The next thing to happen is to validatine this newly received block.

## Independent New Block Verification by Every Node

As the newly mined block is propagated to the network, each node verifies the block based on a [checklist](https://en.bitcoin.it/wiki/Protocol_rules#.22block.22_messages). The independent verification of new blocks ensures that the miners can't cheat. Any wrong doing invalidates the block. 

## Independent Selection of Chain With Most Cumulative Computation Efforts by Every Node

The final step of the consensus process is adding the new block to the blockchain. This happens after validating a block. In reality, a full node does more than that. In fact, after validating a block, a full node puts a new block to one of the three places: the main chain of the blockchain, one of the branches of the blockchain, and the orphans pool. 

I know you are confused. Let's talk more about this. The blockchain is not like a line segment which contains the root to the latest node. It is, in fact, a tree-like structure that has branches.
![Alt Text](/images/blockchain.png)

The main chain is the chain that has the most cumulative computation efforts, that is, forming this chain which requires the most proof of work. Those branches are secondary chains in the blockchain. You will see why would those branches exist shortly when we dive deeper. Once a branch is formed, it will be kept in the blockchain as a valid chain, in case one of the branches is extended and exceed the current main chain. 

When a full node receives a new block, it will search for its parent by looking at the "previous block hash" field, which refers to the parent block. Most of the time, the parent is the latest one of the main chain. But sometimes, the parent block is not found. That means the parent block is also a new block and arrives late. In this case, the new block that has no parent will be put into the orphan pool, waiting for its parent block to arrive. Once the parent block is added to the blockchain, the orphan will be popped out and added to the blockchain.

Now, let's see why would branches exist and how the main chain is resolved among branches.

### Blockchain Branches and Main Chain Selection

In the bitcoin network, every full node has a full copy of the blockchain. In a network as large as bitcoin's, inconsistency is inevitable. The result is that every full node has its own version of blockchain. A branch is formed due to the temporary inconsistency among the network. To resolve the inconsistency, each node only extends the chain with the most proof of work. Therefore, with more and more blocks added to one of the branches, a main chain will be found eventually, resolving the temporary inconsistency. However, waiting for the main chain is another branch. Inconsistencies will always occur. As long as all nodes select the most cumulative proof of work chain, the whole bitcoin network will eventually converge to a consistent state again. 

Andreas Antonopoulos provides a good example of the occurence of inconsistency and the re-convergence in his book. 

As shown below, the whole bitcoin network has a consistent version of the blockchain. Block P in blue is the latest block of the blockchain.

![Alt Text](/images/Before-the-Fork.png)

The form of a new branch is the result of inconsistency. Inconsistency happens whenever more than one candidate blocks competing to form the longest chain. This is possible as long as multiple miners solve the proof-of-work algorithm almost at the same time. To make thing simple, we only consider the situation that two miners find a solution at nearly the same time. As a result, as shown in the following feature, a part of the network sees a candidate block first while another part sees another candidate block. 

![Alt Text](/images/Forking.jpg)

From the above image, we can see that the red part of the network sees a candidate block first. Assume this is block A. They use block A to extend the longest chain. The green part network sees another block (block B), forming their own longest chain. As the propagation goes on, there are two versions of blockchain existing in the network.

![Alt Text](/images/After-the-Fork.jpg)

You might wonder why, for example, the red part nodes won't be affected by block B when they receive it. Normally, a full node will validate it and add it to the blockchain. But in this case, block B is invalid to those nodes in the red part of the network. This is because, block B's "previous block hash" field points to block P, which has already been pointied to by block A. Therefore they ignore block B, resulting in the temporary inconsistency among the network. 

Now, let's see how the inconsistency is resolved. Assume a miner of the green part network wins the proof-of-work competition and adds a new block in pink called block X to the blockchain. 

![Alth Text](/images/Reconverging.jpg)

Again, as the propagation goes on, block X is seen by nodes in both the red network and green network. The green network nodes will simply extend their longest chain with block X since block X points to block B. However, red network nodes now see two chains (blue-red chain and blue-green-pink chain). And they also know that blue-green-pink chain has more cumulative computation effort, as a result, they select the blue-green-pink chain as their main chain. 
The arrival of the pink block is also an announcement of the beginning of the next competition. Miners immediately construct a new block which points to the pink block, resulting in all miners giving up the blue-red chain. As the propagation sweeps the entire network, the blockchain re-converges on a single main chain and the inconsistency is gone.

The bitcoin network is in a dynamic state, going back and forth between inconsistency and convergence. However, thanks to the independent occurrences of the four processes we covered in this part, they can always converge to a single main chain. Next part, we summarize all the bitcoin concepts we covered by extending the example of Trumpy builds the wall. 

## Note

This post is a part of the project called ["Bitcoin and Blockchain"](https://github.com/JunbangHuang/blockchain). Its purpose is to help people understand the detail of the bitcoin system without diving into any textbooks.

The viewpoints of this project are mainly based on my own bitcoin system understanding, Jian Zhang' wonderful blog series -- ["The Secret of Bitcoin and the Blockchain"](http://www.infoq.com/cn/articles/bitcoin-and-block-chain-part01) and a great book -- [Mastering Bitcoin](http://shop.oreilly.com/product/0636920032281.do) by Andreas Antonopoulos. 

This post is revised by [Xiayang Fan](https://www.linkedin.com/in/xiayang-fan-023465a8/).
