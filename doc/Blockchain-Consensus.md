# Bitcoin and Blockchain part V: The Blockchain Consensus

To some degree, we can think of bitcoin as a decentralized public ledger that records every valid transaction. The ledger is called the blockchain. Transactions that made their ways to the blockchain are confirmed and will remain unchanged forever. From last part, we know that during the propagation, a transaction will be put into a block first. So how a block is added to the blockchain? I will talk about this interesting topic in this part.

## Simplified Blockchain Consensus

The consensus process involves a special kind of bitcoin node -- the miner. For now, you can think of a miner of a special bitcoin node that has the ability to add block to the blockchain. The process of adding a new block to the blockchain is called mining, which happens every 10 minutes approximately. 

As other full nodes, a miner validate new transactions and add them to the new block it creates. Meanwhile, it competes with other miners by solving the proof-of-work algorithm. Miner that wins the competition has the right to add its block to the blockchain, earning itself transaction fees (difference between transaction inputs and outputs) from all the transaction contained in the block and mining fee for adding new block to the blockcain. 

The mining process is also the money supply of the bitcoin system. It started with 50 bitcoins per block and halved by half after every 210,000 blocks are mined until the reward reduces to zero [satoshi](https://en.bitcoin.it/wiki/Satoshi_(unit) (1 bitcoin = 100,000,000 satoshi). The rewarding system attracts more miners and encourages them to compete with each others, increasing the computation power to the bitcoin network. The increasing computation power makes it harder and harder to attack the system. It is impossible for an individual attacker to attack the current bitcoin system since it would cost him/her so much to win the competition before doing any harm. An individual or a group must have over [51% of the computation power](http://bitcoin.stackexchange.com/questions/658/what-can-an-attacker-with-51-of-hash-power-do) to fail the system, which is very unlikely to happen.
