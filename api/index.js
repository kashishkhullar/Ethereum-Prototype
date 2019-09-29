const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("../blockchain");
const Block = require("../blockchain/block");
const PubSub = require("./pubsub");
const State = require("../store/state");
const request = require("request");
const TransactionQueue = require("../transaction/transaction-queue");
const Account = require("../account");
const Transaction = require("../transaction");

const app = express();
app.use(bodyParser.json());

const state = new State();
const blockchain = new Blockchain({ state });
const transactionQueue = new TransactionQueue();
const pubsub = new PubSub(blockchain, transactionQueue);
const account = new Account();
const transaction = Transaction.createTransaction({ account });

setTimeout(() => {
	pubsub.broadcastTransaction(transaction);
}, 1000);

app.get("/blockchain", (req, res, next) => {
	const { chain } = blockchain;

	res.json({ chain });
});

app.get("/blockchain/mine", (req, res, next) => {
	const lastBlock = blockchain.chain[blockchain.chain.length - 1];
	const block = Block.mineBlock({
		lastBlock,
		beneficiary: account.address,
		transactionSeries: transactionQueue.getTransactionSeries(),
		stateRoot: state.getStateRoot()
	});
	blockchain
		.addBlock({ block, transactionQueue })
		.then(() => {
			pubsub.broadcastBlock(block);
			res.json({ block });
		})
		.catch(next);
});

app.post("/transact", (req, res, next) => {
	const { to, value, code, gasLimit } = req.body;
	console.log(to, value, code);
	const transaction = Transaction.createTransaction({
		account: !to ? new Account({ code }) : account,
		gasLimit,
		to,
		value
	});
	pubsub.broadcastTransaction(transaction);
	res.json({ transaction });
});

app.get("/account/balance", (req, res, next) => {
	const { address } = req.query;
	const balance = Account.calculateBalance({
		address: address || account.address,
		state
	});
	res.json(balance);
});

app.use((err, req, res, next) => {
	console.error("Internal Server error:", err);
	res.status(500).json({ message: err.message });
});

const PORT = process.argv.includes("--peer")
	? Math.floor(2000 + Math.random() * 1000)
	: 3000;

if (process.argv.includes("--peer")) {
	request("http://localhost:3000/blockchain", (error, reponse, body) => {
		const { chain } = JSON.parse(body);
		console.log(chain);
		blockchain
			.replaceChain({ chain })
			.then(() => console.log("Chain synchronized"))
			.catch(error => console.log("chain sync error", error.message));
	});
}

app.listen(PORT, () => console.log(`listening at port ${PORT}`));
