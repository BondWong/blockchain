# Bitcoin and Blockchain part III: Transactions

Transactions are of the most importance in bitcoin. Everything else, including keys, addresses and blockchain, is designed to ensure the creation, and propagation of blockchain. In this part, we will examine the structure of a transaction, the creation and verification of a transaction and how a transaction become part of the blockchain.

## Simplified Transaction Model
It starts with the creation of a transaction. When we transfer bitcoins to others, a transaction will be created with input and output. Input in a transaction is the debts to the sender while output is the credits added to the receiver. After this, the transaction is signed to indicate the authorization to transfer the bitcoin. The transaction is then propagated on the network. Every node verify the transaction independently before propagated further to other nodes. Senders don't need to trust other nodes since the transaction contains no confidential information. The receivers don't have to trust the senders since if they get invalid transaction, they won't propagate it further. Finally, a transaction is verified by a mining node and included into a block that is eventually appended to the blockchain. Once the transaction is added to the blockchain and followed by sufficient blocks (we can think of this as confirmation step), the transaction is permanent and the bitcoins assigned to the new owner via this transaction are ready to be used.

## Transaction Structure
The following table shows the structure of a transaction:

Size | Field | Description
---- | ----- | -----------
4 bytes | Version | version of rules this transaction follow
1~9 bytes | Input Counter | the number of input
variable | Inputs | one or multiple transaction inputs
1~9 bytes | Output Counter | the number of output
variable | Outputs | one or multiple transaction outputs
4 bytes | Locktime | a unix timestamp that one has to wait before adding it into a block

From the structure, we can see that the most important parts of a transaction are input and output. Since input is output from previous transaction, therefore the most important part is output. To be more precise, an input is from an unspent transaction output (UTXO) of that owner. In bitcoin, there is no such thing as balance. A user's total number of bitcoin is the summation of UTXO contained in hundreds of transactions in hundreds of block in the blockchain. Although UTXO can be any arbitary value, one can not split an already created UTXO. That means, in a transaction, if a UTXO is larger than the desired value, the UTXO still will be used in its entirety and change must be generated in the transaction. This is done by bitcoin wallet software. 

Now that we know that a transaction input is a UTXO. Let's redefine transaction input and output using UTXO term. A user's total number of bitcoins is the sum of all his UTXO. When he is going to spend some bitcoins, his UTXO will be used as a transaction inputs, and the transaction outputs are UTXO assigned to others or assigned back to himself as changes.

## Transaction Outputs and Inputs
