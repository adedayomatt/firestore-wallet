const WalletLedger = require("./WalletLedger");
const TransactionGetter = require("./TransactionGetter");
const System = require("../domain/system/models/System")
class TransactionFeeHandler {
    constructor(transaction) {
        this.transaction = transaction;
    }

    setSystem(system = new System) {
        this.system = system;
        return this;
    }

    getSystem() {
        return this.system;
    }
    setWallet(wallet) {
        this.wallet = wallet;
        return this;
    }
    getWallet() {
        return this.wallet;
    }
    setMetadata(metadata) {
        this.metadata = metadata;
        return this;
    }
    getMetadata() {
        return [
            {key: "transaction_id", value: this.transaction.id}
        ].concat(this.metadata)
    }
    setTransaction(transaction) {
        this.transaction = transaction;
    }
    getTransaction() {
        return this.transaction;
    }

    setFees(fees = []) {
        this.fees = fees;
        return this
    }

    getFees() {
        return this.fees || [];
    }

    async applyFee(feeName, wallet) {
        const amount = new TransactionGetter(this.transaction)
            .getTotalSpecificFee(feeName);
        if(amount > 0) {
            const description = feeName.replaceAll("_"," ") + " | " + this.transaction.title;
            const collectionWallet = await this.system.getCurrencyCollectionWallet(this.getWallet().type, wallet);
            await new WalletLedger()
                .setWalletModel(collectionWallet)
                .setHistoryModel(collectionWallet.History())
                .balance(amount, description, this.getMetadata())
        }
    }

    async apply() {
        this.getFees().map(fee => this.applyFee(fee, fee.toLowerCase()+"_wallet"))
    }
}

module.exports = TransactionFeeHandler;