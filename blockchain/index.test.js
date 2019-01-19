const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain',() => {
	let bc,bc2;

	beforeEach(()=>{
		bc=new Blockchain();
		bc2=new Blockchain();
	});

	it('starts with the genesis block',()=>{
		expect(bc.chain[0]).toEqual(Block.genesis());
	});

	it('adds new block',()=>{
		const data='foo';
		bc.addBlock(data);
		expect(bc.chain[bc.chain.length-1].data).toEqual(data);
	});

	it('validates a valid chain',()=>{
		bc2.addBlock('foo');
		expect(bc.isValidchain(bc2.chain)).toBe(true);
	});

	it('Invalidates the chain with corrupt genesis block',()=>{
		bc2.chain[0].data = 'Bad data';

		expect(bc.isValidchain(bc2.chain)).toBe(false);
	});

	it('Invalidate corrupt chain', () => {
		bc2.addBlock('foo');
		bc2.chain[1].data='Not foo';

		expect(bc.isValidchain(bc2.chain)).toBe(false);
	});

	it('Replaces the chain with valid chain', () => {
		bc2.addBlock('goo');
		bc.replaceChain(bc2.chain);
		expect(bc.chain).toEqual(bc2.chain);
	});

	it('Do not replace chain if less than or equal length',() => {
		bc.addBlock('foo');
		bc.replaceChain(bc2.chain);
		expect(bc.chain).not.toEqual(bc2.chain);
	});
});