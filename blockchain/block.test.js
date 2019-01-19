const Block= require('./block');


describe('Block',()=> {

	let data,block,lastblock;

	beforeEach(() => {
		 data='bar';
		 lastblock=Block.genesis();
		 block=Block.mineBlock(lastblock,data);
	});

	it('Sets `data` to match function',() => {
		expect(block.data).toEqual(data);
	});

	it('Sets `lasthash` to match hash of last block', () => {
		expect(block.lasthash).toEqual(lastblock.hash);
	});

	it('Generates a hash that matches the difficulty', () => {
	expect(block.hash.substring(0 ,block.difficulty)).toEqual('0'.repeat(block.difficulty));
	console.log(block.toString());
	});

	it('Lowers the difficulty for slowly mined block', () => {
		expect(Block.adjustDifficulty(block,block.timestamp+360000)).toEqual(block.difficulty-1);
	});

	it('Raises the difficulty for quickly mined block', () => {
		expect(Block.adjustDifficulty(block,block.timestamp+1)).toEqual(block.difficulty+1);
	});
});

