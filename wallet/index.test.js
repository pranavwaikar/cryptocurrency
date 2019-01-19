const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');
const {INITIAL_BALANCE} = require('../config');

describe('Wallet', () => {
	let wallet,tp,bc;

	beforeEach(() => {
		wallet = new Wallet();
		tp = new TransactionPool();
		bc = new  Blockchain();
	});

	describe('creatting a transaction',() => {

		let transaction,sendAmmount,recipient;

		beforeEach(() => {
			sendAmmount = 50;
			recipient = 'r4ndon-a44re55';
			transaction = wallet.createTransaction(recipient,sendAmmount,bc,tp);
		});

		describe('& doing the same transaction',() => {
			beforeEach(() => {
				wallet.createTransaction(recipient,sendAmmount,bc,tp);
			});

			it('doubles the `sendAmmount` subtracted from wallet balance',() => {
				expect(transaction.outputs.find(output => output.address === wallet.publicKey).ammount).toEqual(wallet.balance - sendAmmount*2);
			});

			it('clones the `sendAmmount` output for recipient',() => {
				expect(transaction.outputs.filter(output => output.address === recipient).map(output => output.ammount)).toEqual([sendAmmount,sendAmmount]);
			});
		});
	});

	describe('calculating a balance',() => {
		let addBalance,repeatAdd,senderWallet;

		beforeEach(() =>{
			senderWallet = new Wallet();
			addBalance=100;
			repeatAdd=3;

			for(let i=0;i<repeatAdd;i++)
			{
				senderWallet.createTransaction(wallet.publicKey,addBalance,bc,tp);
			}

			bc.addBlock(tp.transactions);
		});

		it('calculates the balance for blockchain transactions matching recipients',() => {
			expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
		});

		it('calculates the balance for blockchain transactions matching sender',() => {
			expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));
		});

		describe('now recipient conducts a transaction' ,() => {
			let subtractBalance,recipientBalance;

			beforeEach(() => {
				tp.clear();
				subtractBalance = 60;
				recipientBalance = wallet.calculateBalance(bc);
				wallet.createTransaction(senderWallet.publicKey,subtractBalance,bc,tp);
				bc.addBlock(tp.transactions);
			});

			describe('and sender sends another transaction to recipient',() => {
				beforeEach(() => {
					tp.clear();
					senderWallet.createTransaction(wallet.publicKey,addBalance,bc,tp);
					bc.addBlock(tp.transactions);
				});

				it('calculates recipient balance only using transactions since its most recent one',() => {
					expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance);
				});
			});
		});
	});
});
