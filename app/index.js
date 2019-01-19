const ChainUtil =require('../chain-util');
//INIT-ROUTINE
const isVerified = ChainUtil.init();
if(isVerified)
{
	console.log('POA Access Granted!');
}
else
{
	console.log('POA access Denied!');
	return;
}

const express = require('express');
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');
const HTTP_PORT =process.env.HTTP_PORT || 3001;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pserver = new P2pServer(bc,tp);
const miner = new Miner(bc,tp,wallet,p2pserver);


app.use(bodyParser.json({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
  }));

//miner specific calls
app.get('/blocks', (req,res) => {
	res.json(bc.chain);
});

app.post('/mine',(req,res) => {
	const block = bc.addBlock(req.body.data);
	console.log(`New block added: ${block.toString()}`);

	p2pserver.syncChains();
	res.redirect('/blocks');
});

app.get('/transactions',(req,res) => {
	res.json(tp.transactions);
});

app.get('/mine-transactions',(req,res) => {
	const block = miner.mine();
	console.log(`new block added : ${block.toString()}`);
	res.redirect('/blocks');
});

app.post('/transact',(req,res) => {
	const {recipient,ammount} = req.body;
	const transaction = wallet.createTransaction(recipient,ammount,bc,tp);
	p2pserver.broadcastTransaction(transaction);
	res.redirect('/transactions');
});

app.get('/public-key',(req,res) =>{
	res.json({publicKey:wallet.publicKey});
});

app.get('/balance',(req,res) => {
	const balance = wallet.calculateBalance(bc);
	res.json({balance:balance});
});

//for wallet specific calls
app.get('/create-user',(req,res) => {
	const newWallet = new Wallet();
	var temp = JSON.parse(JSON.stringify(newWallet));
	res.json({balance:temp.balance,privateKey:temp.keyPair.priv,publicKey:temp.publicKey});
});

app.post('/get-user-balance',(req,res) => {
	const {publicKey} = req.body;
	const newbalance = Wallet.calculateBalance(bc,publicKey);
	res.json({balance:newbalance});
});

app.post('/launch-user-transaction',(req,res) => {
	const {recipient,ammount,privateKey,publicKey} = req.body;
	const privateKeyPair = ec.keyFromPrivate(privateKey);
	var userWallet = new Wallet();
	userWallet.loadWallet(privateKeyPair,publicKey);

	if (ammount > userWallet.calculateBalance(bc,publicKey)) {
		res.json({senderAddress:publicKey,recipientAddress:recipient,Ammount:ammount,AmtExceed:true,status:"failed"});
		return;
	}

	const transaction = userWallet.createTransaction(recipient,ammount,bc,tp);
	p2pserver.broadcastTransaction(transaction);
	var d = new Date(transaction.input.timestamp);
	var time = d.toLocaleString();
	res.json({Tid:transaction.id,time:time,senderAddress:transaction.input.address,recipientAddress:transaction.outputs[1].address,
		Ammount:transaction.outputs[1].ammount,Balance:transaction.outputs[0].ammount,status:"pending",AmtExceed:false});
});

app.post('/get-completed-user-transactions',(req,res) => {
	const {publicKey} = req.body;
	var txns = Wallet.getTransactions(bc,publicKey);
	res.json(txns);
});

app.post('/get-pending-user-transactions',(req,res) => {
	const {publicKey} = req.body;
	var txns = TransactionPool.getTransactions(tp,publicKey);
	res.json(txns);
});

app.post('/get-completed-credit-user-transactions',(req,res) => {
	const {publicKey} = req.body;
	var txns = Wallet.getCreditedTransactions(bc,publicKey);
	res.json(txns);
});

app.post('/get-pending-credit-user-transactions',(req,res) => {
	const {publicKey} = req.body;
	var txns = TransactionPool.getCreditedTransactions(tp,publicKey);
	res.json(txns);
});

app.get('/do-mine-transactions',(req,res) => {
	const block = miner.mine();
	//if user transaction is not added only reward transaction is added
	//then its failure to user
	if (typeof block.data[1] === 'undefined') 
	{
		result=	{status:"failed",errors:{invalid:true,sign:true}};
		res.json(result);
		return;
	}
	const transaction = block.data[0];
	var d = new Date(transaction.input.timestamp);
	var time = d.toLocaleString();
	var result;
	
	if (transaction.errors.sign !== false || transaction.errors.invalid !== false) {
		result=	{Tid:transaction.id,time:time,senderAddress:transaction.input.address,status:"failed",errors:transaction.errors};
	} else {
		result= {Tid:transaction.id,time:time,senderAddress:transaction.input.address,recipientAddress:transaction.outputs[1].address,
		Ammount:transaction.outputs[1].ammount,Balance:transaction.outputs[0].ammount,status:"completed",errors:transaction.errors};
	}
 
	res.json(result);
});

app.listen(HTTP_PORT,() => console.log(`Listening on port ${HTTP_PORT}`));
p2pserver.listen();