# Bitcoin and Blockchain part III: Transactions

Transactions are of the most importance in bitcoin. Everything else, including keys, addresses, and the blockchain, is designed to ensure the creation and propagation of transactions. In this part, we will examine the structure of a transaction, the creation and verification of a transaction and how a transaction becomes part of the blockchain.

## Simplified Transaction Model

It starts with the creation of a transaction. When we transfer bitcoins to others, a transaction will be created with the input and output. The input in a transaction is the debts to the sender while the output is the credits added to the receiver. After this, the transaction is signed to indicate the authorization to transfer the bitcoins. The transaction is then propagated on the network. Every node verifies the transaction independently before the transaction is propagated further to other nodes. The senders don't need to trust other nodes since the transaction contains no confidential information. The receivers don't have to trust the senders since if they get an invalid transaction, they won't propagate it further. Finally, a transaction is verified by mining nodes and added to a block that is eventually appended to the blockchain. Once the transaction is added to the blockchain and followed by sufficient blocks (we can think of this as confirmation step), the transaction is permanent and the bitcoins assigned to the new owner via this transaction are ready to be used.


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

From the structure, we can see that the most important parts of a transaction are the input and output. Since an input is an output from the previous transaction, the most important part of a transaction is the output. To be more precise, an input is from an unspent transaction output (UTXO) of that owner. In bitcoin, there is no such thing as balance. A user's total number of bitcoin is the summation of UTXO contained in hundreds of transactions in hundreds of block in the blockchain. Although UTXO can be any arbitrary value, one can not split an already created UTXO. That means, in a transaction, if a UTXO is larger than the desired value, the UTXO still will be used in its entirety and changes must be generated in the transaction. This is done by bitcoin wallet software.

Now that we know that a transaction input is a UTXO. Let's redefine transaction input and output using UTXO term. A user's total number of bitcoins is the sum of all his UTXO. When he is going to spend some bitcoins, his UTXO will be used as the transaction inputs, and the transaction outputs are newly-created UTXO assigned to others or assigned back to himself as changes.

## Transaction Outputs and Inputs

Transaction output consists of two parts: 1. an amount of bitcoin, 2. a locking-script. One can think of a transaction as a certain amount of bitcoin that is locked with a specific secret that only the new owner knows and is able to unlock it. The locking script contained by the output is the secret. The following table shows the structure of an output:


Size | Field | Description
---- | ----- | -----------
8 bytes | Amount | The amount of bitcoin being transferred
1~9 bytes | Locking-Script Size | Locking-Script length in bytes
Variable | Locking-Script | A script defining the conditions required to consume the bitcoins

Transaction input consists of two parts: 1. output pointer, 2. unlocking-script. In a transaction, an input is an unspent transaction output. A transaction input uses output pointer to refer to UTXO. As mentioned before, a transaction output is locked by a secret that only the new user knows. In order to spend the output that the new user received, the new user needs to provide the locking-script with the secret. In here, the secret is the unlocking-script. The following table shows the structure of an input:


Size | Field | Description
---- | ----- | -----------
32 bytes | Transaction Hash | The transaction id containing the UTXO the input pointing to
4 bytes | Output Index | The index number of the UTXO in the pointed transaction
1~9 bytes | Unlocking-Script Size | Unlocking-Script length in bytes
Variable | Unlocking-Script | A script that fulfills the conditions in order to consume the bitcoins
4 bytes | Sequence Number | Disable in current bitcoin

The output pointer consists of transaction hash and output index. When they are using together, the input field can refer to the specific UTXO. The sequence number is currently unused in the bitcoin system.


## Keys and Addresses in Transaction

So what is the secret that locks the UTXO and unlocks the input pointing to the same UTXO? Let's go back to the Trumpy builds wall example. When Trumpy uses his smartphone to send bitcoins to Bob's, a transaction is generated. The transaction contains an output containing the desired amount of bitcoin to Bob, the new owner. In order to make sure Bob gets the bitcoins, the locking script locks the output to Bob's address. When Bob decides to spend those bitcoins, his newly-generated transaction uses his signature to unlock the unspent transaction output he just got.

Note that bitcoin uses public-key cryptography. In this mechanism, the public key is used to encrypt, and a paired private key is used to decrypt. Also note that address and signature are public keys and both are generated from the new owner's private key. In the transaction generated by Trumpy, the output is locked by the locking script to Bob's address, which is a public key generated by Bob's secret, his private key. In the transaction generated by Bob when he is using those bitcoin, Bob provides his signature from his secret, the private key he owns, to unlock the UTXO.


## Transaction Scripts
The transaction script is written in a special script language. It is a [reverse-polish notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation) [stack-based](https://en.wikipedia.org/wiki/Stack_(abstract_data_type)) execution language. In bitcoin implementation, a locking script is called a scriptPubKey, and an unlocking script is called a scriptSig. The scriptPubKey contains an address to which the bitcoins will be assigned to. The scriptSig contains the new owner's signature, by providing which the new owner can unlock the UTXO and spend his bitcoins.

The script executes by processing each item from left to right. When a current item is a number, it is pushed into the stack. When the current item is an operator, numbers will be popped from the stack as parameters, of which the result will be pushed into the stack.

There are three kinds of transactions in bitcoin. They are the standard transaction, spend coinbase, and coinbase/generation. Zooming in, there are five types of standard transaction. We only focus on the most common one -- Pay-to-Public-Key-Hash (P2PKH). In P2PKH, the locking script of an output is a bitcoin address, which can be unlocked by a digital signature of the new owner.

Let's go back to Trumpy builds wall example. Trumpy made a payment of 2 bitcoins to Bob's address. The locking script of this transaction output looks like this:


`OP_DUP OP_HASH160 <Bob's public key hash> OP_EQUAL OP_CEHCKSIG`

`<Bob's public key hash>` is not actually Bob's address, but it is equivalent to his address. After getting his bitcoins, Bob can provide with the following unlocking script to unlock the UTXO. 

`<Bob's signature> <Bob's public key>`

To unlock a transaction output, the combination of the unlocking script and locking script will be executed. The combination script has the following form: unlocking script + locking script. The unlocking script will be executed first and then the locking script. If the final result is true, then the unlock process has succeeded. The following figure shows the execution of the combined script.
 

![Alt Text](/images/script-execution1.png)
![Alt Text](/images/script-execution2.png)

Once the transaction is created and signed with the user's signature, it will then be propagated onto the bitcoin network. Only the user with the assigned address can use the bitcoin carried by the transaction. Before those bitcoins can be used, the transaction must be written into the blockchain. Next part, we will talk about the bitcoin network and blockchain.


## Note

This post is a part of the project called ["Bitcoin and Blockchain"](https://github.com/JunbangHuang/blockchain). Its purpose is to help people understand the detail of the bitcoin system without diving into any textbooks.

The viewpoints of this project are mainly based on my own bitcoin system understanding, Jian Zhang' wonderful blog series -- ["The Secret of Bitcoin and the Blockchain"](http://www.infoq.com/cn/articles/bitcoin-and-block-chain-part01) and a great book -- [Mastering Bitcoin](http://shop.oreilly.com/product/0636920032281.do) by Andreas Antonopoulos. 

This post is revised by [Xiayang Fan](https://www.linkedin.com/in/xiayang-fan-023465a8/).
