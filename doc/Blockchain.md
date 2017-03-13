# Bitcoin and Blockchain part IV: The Blockchain
When you make a payment via your credit card, your transaction would be pending for few days, waiting to be confirmed. Likewise, a bitcoin transaction also requires being confirmed before one can spend the contained bitcoins. In bitcoin system, the process of transaction confirmation is the process of adding a block containing the transaction to the blockchain. Before diving into the blockchain, let's examine the bitcoin network first.

## The Bitcoin Network
The bitcoin network is a peer-to-peer network. Every computer in such a network is called a node. There is no special node in the bitcoin network, every node is equal. Due to the P2P architecture, there is no centralized service nor special server. 

There are four types of nodes, and thus there are four kinds of services. They are the routing service, the blockchain database, the mining service and the wallet service. A bitcoin node is a collection of the above four functions. All nodes in the network include the routing function. This means that all nodes validate and propagate transactions and blocks, and also discover and maintain connections to other nodes. Some nodes serve as the blockchain database. Some nodes contain a full copy of the up-to-date blockchain, and some contain a subset of the blockchain. Nodes that have the full copy of blockchain are called full nodes while those that contain a subset are called [SPV](https://bitcoin.org/en/glossary/simplified-payment-verification) nodes (for the reason that they use a method called simplified payment verification). Miners compete with each other to add a block into the blockchain by solving the proof-of-work algorithm. The proof-of-work algorithm will be covered later when we talk about the blockchain consensus. The wallet node runs the bitcoin wallet software that has the ability to create transaction. 

![Alt Text](/images/bitcoin-network.png)

The above image shows nodes (yellow nodes) with functions other than those we've covered. Those are protocol servers. An example of this is the [pool](https://en.wikipedia.org/wiki/Mining_pool) protocol server that convert the pool protocol from and to bitcoin protocol (TCP/IP). 

Before starting the blockchain, let's talk about the network discovery of bitcoin node, which we found very interesting. 

A new node must discover and connect with at least one node on the network so that it can join the network. The connection between nodes are done via a TCP three-ways-handshake. The new node starts the handshake by sending a version message containing the protocol version, a list of services supported by the new node, the current time, remote node ip address, local ip address, the bitcoin software version and the height of the copy of the blockchain in this node to the peer. After getting the version message, the peer node responds with a verack message and optionally a version message. After the new node gets the verack message, it also sends back a verack message. Finally, when the verack reaches to its peer, the handshake is finished and a connection between these two nodes is established. 

Connected full nodes will exchange height of the copy of the blockchain at a certain frequency. Nodes with a lower height has an outdated copy of the blockchain. After comparing the heights, they will request the missing blocks from others with a larger height. This is how full nodes keep their copy up-to-date.

You may wonder how a new node finds peers. In the bitcoin network, there are seed nodes known by every bitcoin software. A seed node is a long-running reliable node. Once there are connections, the newly connected node will send to its neighbors an address message containing a mapping from its address to its neighbors. The neighbors also will, in turn, send this address message to their neighbors, propagating it throughout the network. In addition, the newly connected node can also ask its neighbors for their address messages that maps their address to their neighbors so that it can find new peers to connect to. Connections between nodes are unreliable. Therefore, the address propagating and acquiring processes happens periodically. In this way, a node can update its connection table and maintain its connection.

The last piece of network discovery is recovering. There is nothing new in recovering, at least not much. During recovery, a node will go through the whole processes of starting. But there is a difference. During recovery, a node will first try to establish the connections with the peers that it found before the connections lost. After this, if this node still can not establish a connection, it will try the seed nodes. 

## The Block Structure
The following table shows the structure of a block:

Size | Field | Description
---- | ----- | -----------
4 bytes | Block size | Block size in bytes
80 bytes | Block header | Block header consists several fields
1~9 bytes | Transaction count | The number of transactions in this block
variable | Transactions | Transactions contained in this block

There are two main parts in a block: the header and the transactions. Like a header in HTTP protocol, a block header contains many fields, which can be divided into four sets. Firstly, the version field that indicates the protocol version that this block uses. Secondly, the reference field pointing to the previous block. Thirdly, the proof-of-work meta data field. This is a set of meta data field related to the proof-of-work algorithm. The proof-of-work mechanism will be covered in next part when we talk about the blockchain consensus. Finally, the merkle tree root. A merkle tree is a data structure that summarizes the transactions contained in a block. With the summary, one can easily figure out whether a transaction is included or not. The header structure shows as the following:

Size | Field | Description
---- | ----- | -----------
4 bytes | Version | Version of protocol used by a block
32 bytes | Previous Block Hash | A reference to the previous block
32 bytes | Merkle Root | The root of merkle tree
4 bytes | Timestamp | The creation time of the block
4 bytes | Difficulty Target | The proof-of-work difficulty target for this block
4 bytes | Nonce | The only changing parameter used in the proof-of-work algorithm 

## Block ID

A block hash is the ID of a block. It is the result of hashing the block header twice using the SHA256 algorithm. 

`previous block hash = SHA256(SHA256(previous block header))` 

The block hash field is empty at the beginning when the block is created. It stays empty until it is about to be added to the blockchain. Till then, the block hash is calculated by each block when they received from the bitcoin network, before adding to their copy of the blockchain. Again, the detail of this process will be covered in next part. 

As mentioned earlier when we talked about the bitcoin network, a full copy of the blockchain is stored in every full node. The blockchain starts with a block called genesis block, which is the root of the whole blockchain. Every time a new is mined, it will be propagated to the network and used to extend local copy of the blockchain in every full node. 

## Merkle Tree

The bitcoin block uses merkle tree as a summary of all the transactions it contains. A merkle tree is a binary tree like data structure, which makes searching for data in the tree efficient. A merkle tree node contains cryptographic hashes of an item it summarizes, therefore it is also called binary hash tree. In our case, the merkle tree node contains the cryptographic hash of a transaction. The following image shows the creation of a merkle tree.

![Alt Text](/images/merkle-tree.png)

The above image is of a four transaction merkle tree -- transaction A, B, C and D. To create a merkle tree, one can recursively hash pairs of nodes till the root. In bitcoin, the hash function is SHA256 algorithm. If we don't have even number of nodes, the last node will be duplicated in order to make the number even. 

In a merkle tree, proving a transaction is in a block is constructing an authentication path that connects the transaction hash to the root, which only need to take log(n) hashes calculations. 

![Alt Text](/images/merkle-tree-proof.png)

Let's see an example shown in the above image. A block contains the merkle tree root. To prove Hk (the green one) is in the merkle tree, one only need to find the authentication path (the blue ones), which means only log(n) data need to be collected. Finally, calculate the root using the path and compare with the root in the block to find out whether a transaction is in the merkle tree or not.

A transaction will be verified after being propagated and will be added to local block if it is valid. To confirm transactions, there is one more step required. That is to add the block containing transaction await to be confirmed to the blockchain. Next up, I will talk about how a block is added to the blockchain.
