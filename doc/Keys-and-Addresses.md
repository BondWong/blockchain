# Bitcoin and Blockchain part II: Keys and Addresses
Keys, addresses, transactions and blockchain are the fundamental concepts of the bitcoin system. In this part, I will talk about the cryptography in bitcoin, and the generation and usage of address.

## Public-Key Cryptography
Cryptography has been used for thousands of years to hide secret messages. The earliest form of cryptography is called Caesar cipher, a substitution cipher, in which each character of the plain text is substituted by another character to form the cipher text (A cipher is an algorithm used for encryption or decryption). One can find that such ciphers depend on the secrecy of the algorithm. Once the algorithm is known, those encrypted messages can easily be decrypted.

In 19th century, Auguste Kerckhoffs stated in what is later called the Kerckhoffs' principle: A cryptosysm should be secure even if everything about the system, except the key, is public knowledge. That is to say that the only thing that need to be secure is the key (The key is a secret needed to decrupt the cipertext, which is usually a string of characters). 

Modern cryptography is based Kerckhoffs' principle. Before the widely use of Public-key cryptography, symmetric-key cryptography is the main-stream cryptography method. 
