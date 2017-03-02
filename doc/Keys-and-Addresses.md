# Bitcoin and Blockchain part II: Keys and Addresses
Keys, addresses, transactions and blockchain are the fundamental concepts of the bitcoin system. In this part, I will talk about the cryptography in bitcoin, and the generation and usage of address.

## A Brief History of Cryptography
Cryptography has been used for thousands of years to hide secret messages. The earliest form of cryptography is called Caesar cipher, a substitution cipher, in which each character of the plain text is substituted by another character to form the cipher text (A cipher is an algorithm used for encryption or decryption). One can find that such ciphers depend on the secrecy of the algorithm. Once the algorithm is known, those encrypted messages can easily be decrypted.

In 19th century, Auguste Kerckhoffs stated what is later called the Kerckhoffs' principle: A cryptosystem should be secure even if everything about the system, except the key, is public knowledge. That is to say that the only thing that need to be secure is the key (The key is a secret needed to decrupt the cipertext, which is usually a string of characters). 

As stated in wikipedia, modern cryptography can be divided into several areas of study. The two main ones are symmetric-key cryptography and public-key cryptography, a asymmetric-key cryptography. Before the widely use of Public-key cryptography, symmetric-key cryptography was the main-stream cryptography method. In symmetric-key cryptography, both the sender and receiver share the same key. Sender uses the key to encrypt messages and send the encrypted messages together with the key to receivers so that the receivers can use the same key to decrypt the messages. The biggest problem is that you need to have a secure way to get the key to the receiver, which is quiet hard to achieve sometimes. Because if we have a safe way to share the key, we probably don't need to be using encryption at the first place.

In 1976, Whitfield Diffie and Martin Hellman published a groundbreaking paper of public-key cryptography. In public-key cryptography, a public key and a private key are used. Though they are different, they are mathematically related. A public can only be constructed from its corresponding private key. From their names, we can easily know that a public key can be freely distributed while its paired private key must remain close to others. In such system, the public key is used for encription and the private key is used for decription. 

In 1978, Ronald Rivest, Adi Shamir, and Len Adleman found the first public-key algorithm, known as RSA algorithm, the last piece of public-key cryptography. A public-key algorithm is used to create a public key from a random picked private key, and the reversing calculation from the public key to the private key is impossible. Other algorithms include elliptic curve based algorithm, which bitcoin uses. The development of public-key cryptography makes the digital signature become possible. A digital signature is easy to produce and is very hard for others to forge. The following picture shows the comparison between symmetric-key cryptography and asymmetric-key cryptography.

![Alt Text](/images/symmetric-key-and-asymmetric-key.gif)

## Private, Public Keys and Addresses in Bitcoin

In bitcoin, an address is a string of digits and characters and is used to receive bitcoins sent from others. Before we dive into the generation of bitcoin address, we need to understand the private key and public mechanism in bitcoin.

Digital keys (public key and private key) in bitcoin are stored and managed by the bitcoin wallet software. The private key is a random 32 bytes long number generated from [SHA-256 algorithm](https://en.wikipedia.org/wiki/SHA-2). The public key is calculated from the private key using [elliptic curve multiplication](https://en.wikipedia.org/wiki/Elliptic_curve_cryptography). The elliptic curve multiplication is a one-way cryptographic function which also determines the valid range of bitcoin private key. Bitcoin uses secp256k1 elliptic curve, which is similar to the following shown one.

![Alt Text](/images/elliptic-curve.png)

To generate the address, we start with the public key, we compute the SHA256 hash and then followed by a RIPEMD160 hash. The resulting number is a 160-bit long fingerprint. Next, we add a [version byte](https://en.bitcoin.it/wiki/List_of_address_prefixes) as prefix to the fingerprint. In the case of address generation, the version byte will be 0x00. After this, we apply SHA256 hash twice to the result we get from the previous step and take the first four bytes as checksum. After getting the checksum, we append it as postfix to our prefixed fingerprint. Finally, encode the whole data using Base58Check. 

The following is the address generation steps:
1. fingerprint = RIPEMD160(SHA256(public key))

2. data = prefix(version byte) + fingerprint

3. checksum = SHA256(SHA256(data))

4. data = data + FirstFourBytes(checksum)

5. address = Base58Check(data)

The following picture shows the above procedure.

![Alt Text](/images/bitcoin-address-generation.png)

With the addresses and private key, we can create transaction to spend or receive our bitcoins. In the next part, I will talk about bitcoin transactions.
