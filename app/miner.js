const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');
class Miner
{
	constructor(blockchain,transactionPool,wallet,p2pServer) {
		this.blockchain=blockchain;
		this.transactionPool=transactionPool;
		this.wallet=wallet;
		this.p2pServer=p2pServer;
	}

	//validate & mine transaction, create reward transaction for miner, add the complete transaction as a block
	//send updated block, send clearance message to all other nodes.
	mine() {
		const validTransactions = this.transactionPool.validTransactions();
		validTransactions.push(Transaction.rewardTransaction(this.wallet,Wallet.blockchainWallet(),this.blockchain));
		const block = this.blockchain.addBlock(validTransactions);
		this.p2pServer.syncChains();
		this.transactionPool.clear();
		this.p2pServer.broadcastClearTransactions();

		return block;
	}
}

module.exports = Miner;