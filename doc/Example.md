# Bitcoin and Blockchain part VI:The Complete Example of How Bitcoin Works

In this part, we extent our Trumpy-builds-wall example to get a better understand of all bitcoin concept we covered in previous parts.

## Pay with bitcoin

As known by, Trumpy wants to build a wall, keeping others from entering his backyard. He picks a brick of 0.75 bitcoin on the website called Bob's and is going to pay with bitcoin. He scans the QRcode using his bitcoin wallet app to complete the payment. The bitcoin system story begins from here.

After scanning the QRCode, Trumpy's bitcoin wallet software start constructing the transaction that assigns bitcoins to Bob, the owner of the Bob's website. To construct the transaction, the wallet needs to create the transaction input and transaction output. As for input, the wallet will look for unspent transaction output assigned to Trumpy from transactions recorded in the blockchain. The wallet will use the UTXO that has the closest value to desired amount, which is 0.75 bitcoin in our case. Despite the closest UTXO that Trumpy is 1 bitcoin, the UTXO will be used in its entirety. This means that changes back to Trumpy are must be generated. Therefore, the transaction has one input and two outputs. 

![Alt Text](/images/Transaction-Trumpy-Pay.png)

As you can see from the above image, there are two outputs. One output is assigned to Bob's address and the other one is assigned back to Trumpy's address. The addresses are contained in the locking scripts in those two outputs. The sum of outputs is smaller than the input. The difference is transaction fee collected by miner. 

Before sending this transaction, there is one more step that Trumpy's wallet software needs to do -- signing the transaction. Signing the transaction is actually signing the transaction input. The transaction input is an unspent transaction output locked by Trumpy's address. In order to spend it, the wallet software creates a unlocking script containing Trumpy's digital signature and adds it to the input. Finally, the transaction construction is completed and it is propagated onto the bitcoin network, waiting to be confirmed. 
## Transaction validation 

After being propagated by Trumpy's wallet software, the transaction assigning bitcoin to Bob will be validated by bitcoin nodes. One of the most important thing to check is that whether the input of this transaction is from an unspent transaction output assigned to Trumpy. From the previous section, we can see that Trumpy provides its unlocking script to unlock the UTXO. Inside the UTXO, there is a locking script. The unlocking script contains Trumpy's signature and public key. The locking script contains an address. Mathematically, the relationship between private key, public key and address is: public key = f(private key), address = g(public key). To verify the transaction, a node will check whether Trumpy's public key can generate the address. If it can, nodes will propagate this transaction further. Otherwise, nodes will ignore this transaction.

## Transaction confirmation

 
