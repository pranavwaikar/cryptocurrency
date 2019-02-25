const Transaction = require('./transaction');

class TransactionPool
{
	constructor() {
		this.transactions = [];
	}

	//if same transaction id is available in pool then update that transaction
	//otherwise create new transaction in pool
	updateOrAddTransaction(transaction) {
		let transactionWithID = this.transactions.find(t => t.id === transaction.id);
		
		if (transactionWithID) {
			this.transactions[this.transactions.indexOf(transactionWithID)] = transaction;
		}
		else {
			this.transactions.push(transaction);
		}

	}

	//find whether transaction exists in pool
	existingTransaction(address) {
		return this.transactions.find(t => t.input.address === address);
	}

	//check whether the transaction input & outputs match each other.
	//if ok then verify transaction by checking signatures
	//return the resultant transaction details 
	validTransactions() {
		return this.transactions.filter(transaction => {
			const outputTotal = transaction.outputs.reduce((total,output) => {
				return total + output.ammount;
			},0);
			
			if(transaction.input.ammount !== outputTotal) {
				console.log(`invalid transaction from ${transaction.input.address}`);
				return;
			}

			if(!Transaction.verifyTransaction(transaction)) {
				console.log(`invalid signature from ${transaction.input.address}`);
				return;
			}
			transaction.errors= {invalid: false,sign: false};

			return transaction;
		});
	}

	clear() {
		this.transactions = [];
	}

	//returns all debit transaction as JS object
	//filters the user transaction which are launched by specified user
	//extract balance, recipient,amt ,etc
	//return such details
	static getTransactions(tp,publicKey) {
		let transactionx = [];
		let tnxobj;
		let txns=[];

		var id,recip,amt,bal,d,time;

		tp.transactions.forEach(transaction =>{
			transactionx.push(transaction);
		});

		const walletInputTs = transactionx.filter(transaction => transaction.input.address === publicKey);

		walletInputTs.forEach(transaction =>{
			id=transaction.id;
			d = new Date(transaction.input.timestamp);
			time = d.toLocaleString();
			transaction.outputs.find(output => {
				if(output.address === publicKey){
					bal=output.ammount;
				}
				else {
					amt=output.ammount;
					recip=output.address;
				}
				tnxobj = {Tid:id,time:time,recipient:recip,ammount:amt,balance:bal,status:"pending"};
			});
			txns.push(tnxobj);
		});

		return txns;
	}

		//returns all credited transaction as JS object
		//filters the user transaction which are not launched by specified user
		//look whether in any transaction user apperars as recipient
		//return such details
		static getCreditedTransactions(tp,publicKey) {
		let transactions = [];
		let tnxobj;
		let txns=[];

		var id,sender,amt,d,time;

		tp.transactions.forEach(transaction =>{
			transactions.push(transaction);
		});

		const walletInputTs = transactions.filter(transaction => transaction.input.address !== publicKey);

		walletInputTs.forEach(transaction =>{
			id=transaction.id;
			d = new Date(transaction.input.timestamp);
			time = d.toLocaleString();
			sender=transaction.input.address;

			console.log('outputs--',transaction.outputs[1]);

			transaction.outputs.find(output => {
				if(output.address === publicKey) {
					amt=output.ammount;
					tnxobj = {Tid:id,time:time,sender:sender,ammount:amt,status:"pending"};
					txns.push(tnxobj);
				}
			});			
		});
		
		return txns;
	}

}

module.exports=TransactionPool;
