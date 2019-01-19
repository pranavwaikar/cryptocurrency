const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool',() => {
	let tp,wallet,transaction,bc;

	beforeEach(() => {
		tp = new TransactionPool();
		wallet = new Wallet();
		bc = new Blockchain();
		transaction = wallet.createTransaction('rn4dop568',30,bc,tp);
	});


	it('Add a transaction to the transaction-pool', () => {
		expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
	});

	it('Updates a transaction in a pool',() => {
		const OldTranscaction = JSON.stringify(transaction);
		const NewTransaction = transaction.update(wallet,'n3wa44re55',40);
		tp.updateOrAddTransaction(NewTransaction);
		expect(JSON.stringify(tp.transactions.find(t => t.id === NewTransaction.id))).not.toEqual(OldTranscaction);
	});

	it('clears transaction',() => {
		tp.clear();
		expect(tp.transactions).toEqual([]);
	});


	describe('Mixing valid & corrupt transaction',() => {
		let validTransactions;

		beforeEach(() =>{
			validTransactions = [...tp.transactions];

			for(let i=0;i<6;i++)
			{
				wallet = new Wallet();
				transaction = wallet.createTransaction('rn4dop7890',30,bc,tp);
				if(i%2 == 0)
				{
					transaction.input.ammount=50000;
				}
				else
				{
					validTransactions.push(transaction);
				}
			}
		});

		it('shows a difference between valid and currupt transactions',() => {
			expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
		});

		it('grabs valid transactions',() => {
			expect(tp.validTransactions()).toEqual(validTransactions);
		});
	});
});


