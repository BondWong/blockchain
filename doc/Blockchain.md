# Bitcoin and Blockchain part IV: The Blockchain
When you make a payment via your credit card, your transaction is pending for few days, waiting to be confirmed. Likewise, a bitcoin transaction also require being confirmed before one can spend the contained bitcoins. In bitcoin system, the process of confirmation is the process of adding a block containing the transaction to the blockchain. Before diving into the blockchain, let's exam the bitcoin network first.

## The Bitcoin Network
The bitcoin network is a peer-to-peer network. Every computer in such network is called node. There is no special node in bitcoin network, every node is equal. Due to the P2P architecture, there is no centralized service nor special server. 

There are four types of node, and thus there are four kinds of service. They are routing, the blockchain database, mining and the wallet service. A bitcoin node is a collection of the above four functions. All nodes in the network include the routing function. This means that all nodes validate and propagate transactions and blocks, and also discover and maintain connections to other nodes. Some nodes serve as the blockchain database. Some nodes contain a full copy of up-to-date blockchain, and some contain a subset of the blockchain. Nodds have the full copy of blockchain are called full node while those that contain a subt are called [SPV](https://bitcoin.org/en/glossary/simplified-payment-verification) nodes (for the reason that they use a method called simplified payment verification). Miner compete with each other to add a block into the blockchain by solving the proof-of-work algorithm. The proof-of-work algorithm will be covered later when we talk about blockchain consensus. The wallet node runs the bitcoin wallet software that has the ability to create transaction. 

![Alt Text](/images/bitcoin-network.png)

The above image shows nodes (yellow nodes) with functions other than those we've covered. Those are protocol servers. An example of this is the [pool](https://en.wikipedia.org/wiki/Mining_pool) protocol server that convert the pool protocol from and to bitcoin protocol (TCP/IP). 

Before starting the blockchain, let's talk about network discovery of bitcoin node, which I found very interesting. 

A new node must discover and connect at least one node on the network so that it can join the network. The connection between nodes are done via a TCP three-ways-handshake. The new node starts the handshake by sending a version message containing the protocol version, a list of services supported by the new node, the current time, remote node ip address, local ip address, the bitcoin software version and the height of the copy of the blockchain in this node to the peer. After getting the version message, the peer node response with a verack message and optionally a version message. After the new node gets the verack message, it also sends back a verack message. Finally, with the verack reaches to its peer, the handshake is finished and a connection between these two nodes is established. 
/
You may wonder how a new node finds peers. In the bitcoin network, there are seed nodes known by every bitcoin software. A seed node is a long-running reliable node. Once there are connections, the newly connected node will send to its neighbors an address message containing mapping from its address to its neighbors. The neighbors also will, in turn, send this address message to their neighbors, propagating it to the network. Besides, the newly connected node can also ask its neighbors for their address messages that maps their address to their neighbors so that it can find new peers to connect to. Connections between nodes are unreliable. Therefore, the address propagating and acquiring process happens periodically. In this way, a node can update its connection table and keep itself stay connected. 

The last piece of the network discovery is recovering. There is nothing new in recovering, at least not much. During the recovery, a node will go through the whole processes of starting. But there is a difference. During the recovery, a node will first try to establish connection with the peers that it found before the connections lost. After this, if this node still can not establish a connection, it will try the seed nodes. 

## The Block Structure
The following table shows the structure of a block:

Size | Field | Description
---- | ----- | -----------
4 bytes | Block size | Block size in bytes
80 bytes | Block header | Block header consists several fields
1~9 bytes | Transaction count | The number of transactions in this block
variable | Transactions | Transactions contained in this block

Like a header in HTTP protocol, a block header contains many fields. There are four set of metadata. Firstly, the version filed that indicates the protocol version that this block uses. Secondly, the reference pointing to the previous block. Thirdly, proof-of-work meta data. This is a set of meta data related to the proof-of-work algorithm. The proof-of-work mechanism will be covered in next part when we talk about blockchain consensus. Finally, the merkle tree root. A merkle tree is a data structure that summarized transactions contained in a block. With the summary, one can easily figure out whether a transaction is included or not. The header structure shows as the following:

Size | Field | Description
---- | ----- | -----------
4 bytes | Version | Version of protocol used by a block
32 bytes | Previous Block Hash | A reference to the previous block
32 bytes | Merkel Root | The root of merkel tree
4 bytes | Timestamp | The creation time of the block
4 bytes | Difficulty Target | The proof-of-work difficulty target of this block
4 bytes | Nonce | The only changing parameter used in the proof-of-work algorithm 

A block hash is the ID of a block. It is the result by hashing the block header twice using the SHA256 algorithm. 

`previous block hash = SHA256(SHA256(previous block header))` 

The block hash field is empty at the beginning when the block is created. It stays empty until it is about to be added to the blockchain. Till then, the block hash is calculated by each block when they received from the bitcoin network, before adding to their copy of the blockchain. Again, the detail of this process will be covered in next part. 


