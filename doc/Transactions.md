# Bitcoin and Blockchain part III: Transactions

Transactions are of the most importance in bitcoin. Everything else, including keys, addresses and blockchain, is designed to ensure the creation, and propagation of blockchain. In this part, we will examine the structure of a transaction, the creation and verification of a transaction and how a transaction become part of the blockchain.

## Simplified Transaction Model
It starts with the creation of a transaction. When we transfer bitcoins to others, a transaction will be created with input and output. Input in a transaction is the debts to the sender while output is the credits added to the receiver. After this, the transaction is signed to indicate the authorization to transfer the bitcoin. The transaction is then propagated on the network. Every node verify the transaction independently before propagated further to other nodes. Senders don't need to trust other nodes since the transaction contains no confidential information. The receivers don't have to trust the senders since if they get invalid transaction, they won't propagate it further. Finally, a transaction is verified by a mining node and included into a block that is eventually appended to the blockchain. Once the transaction is added to the blockchain and followed by sufficient blocks (we can think of this as confirmation step), the transaction is permanent and the bitcoins assigned to the new owner via this transaction are ready to be used.

## Transaction Structure
The following table shows the structure of a transaction:
| Size | Field | Description |
| ---- | ----- | ----------- |
| 4 bytes | Version | version of rules this transaction follow |
| 1~9 bytes | Input Counter | the number of input |
| variable | Inputs | one or multiple transaction inputs |
| 1~9 bytes | Output Counter | the number of output |
| variable | Outputs | one or multiple transaction outputs |
| 4 bytes | Locktime | a unix timestamp that one has to wait before adding it into a block |


