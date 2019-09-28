const PubNub = require("pubnub");
const Transaction = require("../transaction");
const credentials = {
	publishKey: "pub-c-4c06cdc3-0786-4abc-bd76-08924e3026eb",
	subscribeKey: "sub-c-92a008ec-e1c9-11e9-afc7-46ac3f2c706c",
	secretKey: "sec-c-YmFjNmQ2ODYtNzZmMy00MjcxLWI4NWYtNzNhYWQ2N2M0YWRj"
};

const CHANNEL_MAP = {
	TEST: "TEST",
	BLOCK: "BLOCK",
	TRANSACTION: "TRANSACTION"
};

class PubSub {
	constructor(blockchain, transactionQueue) {
		this.pubnub = new PubNub(credentials);
		this.subsreibeToChannels();
		this.listen();
		this.blockchain = blockchain;
		this.transactionQueue = transactionQueue;
	}

	subsreibeToChannels() {
		this.pubnub.subscribe({
			channels: Object.values(CHANNEL_MAP)
		});
	}

	publish({ channel, message }) {
		this.pubnub.publish({ channel, message });
	}

	listen() {
		this.pubnub.addListener({
			message: messageObject => {
				const { channel, message } = messageObject;
				const parsedObject = JSON.parse(message);
				console.log("Message Recieved. Channel", channel);

				switch (channel) {
					case CHANNEL_MAP.BLOCK:
						console.log("block message", message);
						this.blockchain
							.addBlock({
								block: parsedObject,
								transactionQueue: this.transactionQueue
							})
							.then(() =>
								console.log("New block added", parsedObject)
							)
							.catch(error => {
								console.log(
									"New block rejected",
									error.message
								);
							});
						break;
					case CHANNEL_MAP.TRANSACTION:
						console.log("Recieved transaction", parsedObject.id);

						this.transactionQueue.add(
							new Transaction(parsedObject)
						);
						// console.log(this.transactionQueue);
						break;
					default:
						return;
				}
			}
		});
	}

	beoadcastBlock(block) {
		this.publish({
			channel: CHANNEL_MAP.BLOCK,
			message: JSON.stringify(block)
		});
	}

	broadcastTransaction(transaction) {
		this.publish({
			channel: CHANNEL_MAP.TRANSACTION,
			message: JSON.stringify(transaction)
		});
	}
}
module.exports = PubSub;
