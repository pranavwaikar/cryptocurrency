const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); //standards of efficient crypto prime 256bit Kabbalah version 1
const uuidV1 = require('uuid/v1');
const SHA256= require('crypto-js/sha256');
const { SHARED_TOKEN,SECRET_DATA,SECRET_ACCESS_TOKEN } = require('./config');

class ChainUtil
{

	static genKeyPair()
	{
		return ec.genKeyPair();
	}

	static id()
	{
		return uuidV1();
	}

	static hash(data)
	{
		return SHA256(JSON.stringify(data)).toString();
	}

	static verifySignature(publicKey,signature,dataHash)
	{
		return ec.keyFromPublic(publicKey,'hex').verify(dataHash,signature);
	}

	static extractPrivateKey(keyPair)
	{
		var temp = JSON.parse(JSON.stringify(keyPair));
		var key=temp.priv;
		const privateKeyPair = ec.keyFromPrivate(key);
		return privateKeyPair;
	}

	static init()
	{
		var hash = SHA256(JSON.stringify(SECRET_DATA)).toString();
		const privateKeyPair = ec.keyFromPrivate(SECRET_ACCESS_TOKEN);
		var sign = ec.sign(hash,privateKeyPair);
		const isVerified = ec.keyFromPublic(SHARED_TOKEN,'hex').verify(hash,sign);
		
		return isVerified;
	} 

}

module.exports = ChainUtil;
