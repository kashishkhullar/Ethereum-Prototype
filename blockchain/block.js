const { GENESIS_DATA, MINE_RATE } = require("../config");
const Transaction = require("../transaction");
const { keccakHash } = require("../util");
const Trie = require("../store/trie");

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

class Block {
	constructor({ blockHeaders, transactionSeries }) {
		this.blockHeaders = blockHeaders;
		this.transactionSeries = transactionSeries;
	}

	static calculateBlockTargetHash({ lastBlock }) {
		const value = (
			MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty
		).toString(16);

		if (value.length > HASH_LENGTH) {
			return "f".repeat(HASH_LENGTH);
		}
		return "0".repeat(HASH_LENGTH - value.length) + value;
	}

	static adjustDifficulty({ lastBlock, timestamp }) {
		const { difficulty } = lastBlock.blockHeaders;

		if (difficulty < 1) {
			return 1;
		}
		if (timestamp - lastBlock.blockHeaders.timestamp > MINE_RATE) {
			return difficulty - 1;
		}

		return difficulty + 1;
	}

	static mineBlock({ lastBlock, beneficiary, transactionSeries, stateRoot }) {
		const target = Block.calculateBlockTargetHash({ lastBlock });
		let timestamp, truncatedBlockHeaders, header, nonce, underTargetHash;
		const transactionTrie = Trie.buildTrie({ items: transactionSeries });

		do {
			timestamp = Date.now();
			truncatedBlockHeaders = {
				parentHash: keccakHash(lastBlock.blockHeaders),
				beneficiary,
				difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
				number: lastBlock.blockHeaders.number + 1,
				timestamp,
				transactionRoot: transactionTrie.rootHash,
				stateRoot
			};

			header = keccakHash(truncatedBlockHeaders);

			nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);

			underTargetHash = keccakHash(header + nonce);
		} while (underTargetHash > target);
		return new this({
			blockHeaders: {
				...truncatedBlockHeaders,
				nonce
			},
			transactionSeries
		});
	}

	static validateBlock({ lastBlock, block, state }) {
		// console.log(lastBlock);
		// console.log(block);
		return new Promise((resolve, reject) => {
			if (keccakHash(block) === keccakHash(Block.genesis())) {
				return resolve();
			}
			if (
				keccakHash(lastBlock.blockHeaders) !==
				block.blockHeaders.parentHash
			) {
				return reject(
					new Error(
						"The parent hash must be a hash of the last block's headers"
					)
				);
			}

			if (
				block.blockHeaders.number !==
				lastBlock.blockHeaders.number + 1
			) {
				return reject(new Error("Number must be incremented by 1"));
			}

			if (
				Math.abs(
					lastBlock.blockHeaders.difficulty -
						block.blockHeaders.difficulty
				) > 1
			) {
				return reject(
					new Error("The difficulty must only adjust by 1")
				);
			}

			const rebuiltTransactionsTrie = Trie.buildTrie({
				items: block.transactionSeries
			});

			if (
				rebuiltTransactionsTrie.rootHash !==
				block.blockHeaders.transactionRoot
			) {
				return reject(new Error("Transaction root deos not match"));
			}

			const target = Block.calculateBlockTargetHash({ lastBlock });
			const { blockHeaders } = block;
			const { nonce } = blockHeaders;
			const truncatedBlockHeaders = { ...blockHeaders };
			delete truncatedBlockHeaders.nonce;
			const header = keccakHash(truncatedBlockHeaders);
			const underTargetHash = keccakHash(header + nonce);

			if (underTargetHash > target) {
				return reject(
					new Error(
						"The block does not meet the proof of work requirement"
					)
				);
			}

			console.log("Finei till HERE");

			Transaction.validateTransactionSeries({
				transactionSeries: block.transactionSeries,
				state
			})
				.then(resolve)
				.catch(reject);
		});
	}

	static runBlock({ block, state }) {
		for (const transaction of block.transactionSeries) {
			Transaction.runTransaction({ transaction, state });
		}
	}

	static genesis() {
		return new this(GENESIS_DATA);
	}
}

module.exports = Block;
