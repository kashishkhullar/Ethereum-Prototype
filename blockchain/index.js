const Block = require("./block");

class Blockchain {
	constructor() {
		this.chain = [Block.genesis()];
	}
}

module.exports = Blockchain;

const blockchain = new Blockchain();
console.log(blockchain.chain);
