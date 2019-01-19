const Transaction = require('./transaction');

class TransactionPool
{
	constructor()
	{
		this.transactions = [];
	}

	updateOrAddTransaction(transaction)
	{
		let transactionWithID = this.transactions.find(t => t.id === transaction.id);
		
		if (transactionWithID) 
		{
			this.transactions[this.transactions.indexOf(transactionWithID)] = transaction;
		}
		else
		{
			this.transactions.push(transaction);
		}

	}

	existingTransaction(address)
	{
		return this.transactions.find(t => t.input.address === address);
	}

	validTransactions()
	{
		return this.transactions.filter(transaction => {
			const outputTotal = transaction.outputs.reduce((total,output) => {
				return total + output.ammount;
			},0);
			
			if(transaction.input.ammount !== outputTotal)
			{
				console.log(`invalid transaction from ${transaction.input.address}`);
				return;
			}

			if(!Transaction.verifyTransaction(transaction))
			{
				console.log(`invalid signature from ${transaction.input.address}`);
				return;
			}
			transaction.errors= {invalid: false,sign: false};

			return transaction;
		});
	}

	clear()
	{
		this.transactions = [];
	}

	static getTransactions(tp,publicKey)
	{
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
				if(output.address === publicKey)
				{
					bal=output.ammount;
				}
				else
				{
					amt=output.ammount;
					recip=output.address;
				}
				tnxobj = {Tid:id,time:time,recipient:recip,ammount:amt,balance:bal,status:"pending"};
			});
			txns.push(tnxobj);
		});

		return txns;
	}

		static getCreditedTransactions(tp,publicKey)
	{
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
				if(output.address === publicKey)
				{
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
