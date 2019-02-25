const Transaction = require('./transaction');
const wallet = require('./index');
const Blockchain = require('../blockchain');
const { MINING_REWARD } = require('../config');

describe('Transaction' , () => {
	let transaction,walletx,reciepient,ammount;
	let bc = new Blockchain();
	beforeEach(() => {
		walletx = new wallet();
		ammount = 50;
		reciepient = 'r1c6ep4e3t';
		transaction= Transaction.newTransaction(walletx,reciepient,ammount);
	});

	

	it('Outputs the `ammount` subtracted from wallet balance ', () => {
		expect(transaction.outputs.find(output => output.address === walletx.publicKey).ammount).toEqual(walletx.balance - ammount);
	});

	it('Outputs the `ammount` added to the reciepient', () => {
		expect(transaction.outputs.find(output => output.address === reciepient).ammount).toEqual(ammount);
	});

	it('inputs the balance of wallet', () => {
		expect(transaction.input.ammount).toEqual(walletx.balance);
	});

	it('validates a valid transaction',() => {
		expect(Transaction.verifyTransaction(transaction)).toBe(true);
	});

	it('invalidates a currupt transaction', () => {
		transaction.outputs[0].ammount = 50000;
		expect(Transaction.verifyTransaction(transaction)).toBe(false);
	});


	describe('transacting with an ammount that exceeds the balance', () => {
		beforeEach(() => {
			ammount = 50000;
			transaction = Transaction.newTransaction(walletx,reciepient,ammount);
		});

		it('Does not create transaction',() => {
			expect(transaction).toEqual(undefined);
		});

	});

	describe('and update a transaction', () => {
		let nextAmmount,nextReciepient;

		beforeEach(() => {
			nextAmmount = 20;
			nextReciepient = 'n3xtadd5e66';
			transaction = transaction.update(walletx,nextReciepient,nextAmmount);
		});

		it('subtract nextAmmount from senders output',()=> {
			expect(transaction.outputs.find(output => output.address === walletx.publicKey).ammount).toEqual(walletx.balance - ammount - nextAmmount );
		});

		it('outputs an ammount for nextReciepient', () => {
			expect(transaction.outputs.find(output => output.address === nextReciepient).ammount).toEqual(nextAmmount);
		});
	});

	describe('creating a reward transaction',() => {
		beforeEach(() => {
			transaction = Transaction.rewardTransaction(walletx,wallet.blockchainWallet(),bc);
		});

		it(`reward the miner's wallet`,() =>{
			expect(transaction.outputs.find(output => output.address === walletx.publicKey).ammount).toBeGreaterThanOrEqual(MINING_REWARD);
		});
	});
});
