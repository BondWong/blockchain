# Bitcoin and Blockchain part IV: The Blockchain
When you make a payment via your credit card, your transaction is pending for few days, waiting to be confirmed. Likewise, a bitcoin transaction also require being confirmed before one can spend the contained bitcoins. In bitcoin system, the process of confirmation is the process of adding a block containing the transaction to the blockchain. Before diving into the blockchain, let's exam the bitcoin network first.

## The Bitcoin Network
The bitcoin network is a peer-to-peer network. Every computer in such network is called node. There is no special node in bitcoin network, every node is equal. Due to the P2P architecture, there is no centralized service nor special server. 

There are four types of node, and thus there are four kinds of service. They are routing, the blockchain database, mining and the wallet service. A bitcoin node is a collection of the above four functions. All nodes in the network include the routing function. This means that all nodes validate and propagate transactions and blocks, and also discover and maintain connections to other nodes. Some nodes serve as the blockchain database. Some nodes contain a full copy of up-to-date blockchain, and some contain a subset of the blockchain. Nodds have the full copy of blockchain are called full node while those that contain a subt are called [SPV](https://bitcoin.org/en/glossary/simplified-payment-verification) nodes (for the reason that they use a method called simplified payment verification). Miner compete with each other to add a block into the blockchain by solving the proof-of-work algorithm. The proof-of-work algorithm will be covered later when we talk about blockchain consensus. The wallet node runs the bitcoin wallet software that has the ability to create transaction. 

![Alt Text](/images/bitcoin-network.png)

The above image shows nodes (yellow nodes) with functions other than those we've covered. Those are protocol servers. An example of this is the [pool](https://en.wikipedia.org/wiki/Mining_pool) protocol server that convert the pool protocol from and to bitcoin protocol (TCP/IP). 
