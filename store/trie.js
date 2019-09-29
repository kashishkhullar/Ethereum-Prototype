const _ = require("lodash");
const { keccakHash } = require("../util");

class Node {
	constructor() {
		this.value = null;
		this.childMap = {};
	}
}

class Trie {
	constructor() {
		this.head = new Node();
		this.generateRootHash();
	}

	generateRootHash() {
		this.rootHash = keccakHash(this.head);
	}

	get({ key }) {
		let node = this.head;

		for (let character of key) {
			if (!node.childMap[character]) {
				return null;
			} else {
				node = node.childMap[character];
			}
		}

		return _.cloneDeep(node.value);
		// return node.value;
	}

	put({ key, value }) {
		let node = this.head;

		for (let character of key) {
			if (!node.childMap[character]) {
				node.childMap[character] = new Node();
			}

			node = node.childMap[character];
		}

		node.value = value;
		this.generateRootHash();
	}

	static buildTrie({ items }) {
		const trie = new this();

		for (const item of items.sort((a, b) => {
			keccakHash(a) > keccakHash(b);
		})) {
			trie.put({ key: keccakHash(item), value: item });
		}
		return trie;
	}
}

module.exports = Trie;

// const trie = new Trie();

// trie.put({ key: "foo", value: "bar" });
// trie.put({ key: "fo", value: "bar2" });

// let data = { balance: 100 };

// trie.put({ key: "faa", value: data });

// console.log(trie.get({ key: "faa" }));
// console.log(trie.rootHash);

// data.balance += 100;
// console.log(trie.get({ key: "faa" }));
// trie.generateRootHash();
// console.log(trie.rootHash);
