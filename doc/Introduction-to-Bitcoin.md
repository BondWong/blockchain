# Bitcoin and Blockchain part I: Introduction to Bitcoin

## The birth of Bitcoin
On September 2008, Lehman Brothers filed for bankruptcy, setting off the financial crisis that swept the world. To deal with the crisis, governments took the strategy of quantitative easing, rescuing heavily damaged economies and fragile financial organizations. These measures were widely questioned and sparked the Occupy Wall Street movement.
Bitcoin was invented in 2008, the year the world was suffering from the crisis. A paper titled "Bitcoin: A Peer-to-Peer Electronic Cash System" written under the alias of Satoshi Nakamoto was published and later was used as a reference for the Bitcoin implementation. In 2009 January 1, Satoshi Nakamoto mined the first block -- the Genesis Block using a server in Helsinki, Finland and won the first miner reward of 50 bitcoins. On the genesis block, Satoshi Nakamoto wrote down the sentence "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks", marking the beginning of Bitcoin and mocking the failure of the financial system. Satoshi Nakamoto withdrew from the public in April of 2011, leaving the world a big question of who is Satoshi Nakamoto. Who is Satoshi Nakamoto? Maybe we will never know.


## Bitcoin and blockchain
In history, there are few things as controversial as bitcoin. Supporters believe it is invaluable while detractors think it is valueless. Bitcoin is a decentralized crypto currency. What is important in bitcoin system is not bit nor coin, but a decentralized digital ledger. We call this ledger the blockchain. Like a physical ledger, a block in blockchain is like a page in the ledger, recording every transaction. Unlike the physical ledger, which is owned by organizations like governments or other financial companies and kept private from the public, the blockchain is open to the public and everyone in the bitcoin network owns a full copy of it. (This is not necessarily true since now a bitcoin node can own a partial copy of blockchain to work.) I will discuss this topic later in the blockchain part.



## Bitcoin in a real-life example
Before wrapping up the first part, I will give a real-life example of using bitcoin. Later in the article series, I will also extend the same example to explain different bitcoin concepts. After the whole series, a complete example will be given so that you can build a full picture of bitcoin system.

Trumpy wants to buy a brick so that he can build a wall blocking others from entering his backyard. He goes to Bob's, the brick seller website, and picks up a brick that he is going to pay by scanning the QRcode shown on the website with his bitcoin wallet app on his smartphone right next to the twitter app. After few seconds, Trumpy sees the transaction shown on his wallet app, completing the transaction.

## Bitcoin Transaction

Traditionally, a transaction means that we tell the trusted-third-party such as the bank that the we authorized the transfer of our money to a new owner. Likewise, a bitcoin transaction tells the bitcoin network that the bitcoin’s owner authorized the transfer of some bitcoin to a new owner. Each transaction contains one or more inputs and one or more outputs. Inputs are the debts against a bitcoin account and outputs are credits to the new owner's bitcoin account. Summation of outputs of a transaction might be less than the inputs, and the difference would be a transaction fee for the miner who adds and maintains transaction in the blockchain.


![Alt text](/images/transaction-chain.png)

After getting the ownership of bitcoin, the new owner can create another transaction to spend the bitcoin. In fact, in bitcoin, a transaction input is an output from a previous transaction, forming a chain moving bitcoin from input to output. The figure on the left is an example of a transaction chain, from which we can see that a transaction input is from a previous transaction output.
In the next part, I will talk about the bitcoin key and address and their roles in bitcoin transactions.


##Note

This post is a part of the whole project ["Bitcoin and Blockchain"](https://github.com/JunbangHuang/blockchain), which with a purpose of helping people understand the detail of the bitcoin system without diving into any textbooks.

The view points of this project are mainly based on my own bitcoin system understanding, Jian Zhang' wonderful blog series -- ["The Secret of Bitcoin and the Blockchain"](http://www.infoq.com/cn/articles/bitcoin-and-block-chain-part01) and a great book -- [Mastering Bitcoin](http://shop.oreilly.com/product/0636920032281.do) by Andreas Antonopoulos. 

This post is revised by [Xiayang Fan](https://www.linkedin.com/in/xiayang-fan-023465a8/).
