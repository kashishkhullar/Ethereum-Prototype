class TransactionQueue {
	constructor() {
		this.transactionsMap = {};
	}

	add(transaction) {
		this.transactionsMap[transaction.id] = transaction;
	}

	getTransactionSeries() {
		return Object.values(this.transactionsMap);
	}

	clearBlockTransactions({ transactionSeries }) {
		for (let transaction of transactionSeries) {
			delete this.transactionsMap[transaction.id];
		}
	}
}

module.exports = TransactionQueue;
