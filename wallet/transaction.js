const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction
{
	constructor() {
		this.id=ChainUtil.id();
		this.input=null;
		this.outputs = [];
		this.errors;
	}

	//updates the transactions if repeated
	update(senderWallet,recipient,ammount) {
		const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);
		if(ammount > senderOutput.ammount) {
			console.log(`Ammount: ${ammount} exceeds balance`);
			return;
		}

		senderOutput.ammount = senderOutput.ammount - ammount;
		this.outputs.push({ammount,address: recipient});
		Transaction.signTransaction(this,senderWallet);

		return this;
	}

	//the outputs are the transaction data
	//push outputs as transaction attribute
	static transactionWithOutputs(senderWallet,outputs) {
		const transaction = new this();
		transaction.outputs.push(...outputs);
		Transaction.signTransaction(transaction,senderWallet);
		return transaction;
	}

	//create new transaction data & output attributes for it
	static newTransaction(senderWallet, recipient,ammount) {
		if(ammount > senderWallet.balance) {
			console.log(`Ammount : ${ammount} exceeds balance`);
			return;
		}
		
		return Transaction.transactionWithOutputs(senderWallet,[
		{ammount: senderWallet.balance - ammount, address: senderWallet.publicKey },
		{ammount, address: recipient}
		]);
	}

	//calculate reward ammount & generate reward transaction details
	// add that data in the block as well
	static rewardTransaction(minerWallet,blockchainWallet,bc) {
		const lastblock=bc.chain[bc.chain.length - 1];
		let {difficulty} = lastblock;
		var reward = difficulty * MINING_REWARD;
		return Transaction.transactionWithOutputs(blockchainWallet,[{
			ammount: reward , address:minerWallet.publicKey
		}]);
	}

	//generate digital signature & add it as transaction input 
	static signTransaction(tranasction,senderWallet) {
		tranasction.input = {
			timestamp : Date.now(),
			ammount : senderWallet.balance,
			address : senderWallet.publicKey,
			signature : senderWallet.sign(ChainUtil.hash(tranasction.outputs))
		}
	}

	//verify transaction by analyzing digital signature
	static verifyTransaction(tranasction) {
		return ChainUtil.verifySignature(tranasction.input.address,tranasction.input.signature,ChainUtil.hash(tranasction.outputs));
	}
}

module.exports = Transaction;
