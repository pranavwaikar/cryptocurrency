const ChainUtil = require('../chain-util');
const {DIFFICULTY,MINE_RATE} = require('../config');


//represents a block in blockchain
class Block
{
	constructor(timestamp,lasthash,hash,data,nonce,difficulty) {
		this.timestamp=timestamp;
		this.lasthash=lasthash;
		this.hash=hash;
		this.data=data;
		this.nonce=nonce;
		this.difficulty=difficulty || DIFFICULTY;
	}

	toString() {
		return `Block:
		Timestamp: ${this.timestamp}
		Lasthash: ${this.lasthash.substring(0,10)}
		hash: ${this.hash.substring(0,10)}
		nonce:${this.nonce}
		difficulty:${this.difficulty}
		Data: ${this.data}
		`;
	}

	//the first block in the chain is hand-made. 
	static genesis() {
		return new this('genesis time','--------','First-hash-p97',[],0,DIFFICULTY);
	}

	//here we are defining POW consensus protocol 
	//adds new block upon success
	static mineBlock(lastBlock,data) {
		let hash,timestamp;
		let {difficulty} = lastBlock;
		const lastHash= lastBlock.hash;
		let nonce=0;
		do
		{
			nonce++;
			timestamp=Date.now();
			difficulty = Block.adjustDifficulty(lastBlock,timestamp);
			hash= Block.hash(timestamp,lastHash,data,nonce,difficulty);
		}while(hash.substring(0,difficulty) !== '0'.repeat(difficulty));
		

		return new this(timestamp,lastHash,hash,data,nonce,difficulty);
	}

	//generates SHA256 hash using the transaction input fields
	static hash(timestamp,lasthash,data,nonce,difficulty) {
		return ChainUtil.hash(`${timestamp}${lasthash}${data}${nonce}${difficulty}`).toString();
	}

	//calculates SHA256 hash of given block
	static blockHash(block) {
		const {timestamp,lasthash,data,nonce,difficulty} = block;
		return Block.hash(timestamp,lasthash,data,nonce,difficulty);
	}

	//dynamic difficulty mining algo
	//depending on minirg rate change difficulty os system
	static adjustDifficulty(lastBlock,currentTime) {
		let {difficulty} = lastBlock;
		difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty+1 : difficulty -1;

		return difficulty;
	}
}

module.exports=Block;

