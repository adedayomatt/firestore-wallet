const constants = require("../enums/constants")
class WalletLedger {

    constructor(walletModel, historyModel) {
        this.setWalletModel(walletModel);
        this.setHistoryModel(historyModel);
        this.setWalletData({
            amount: 0,
            blocked: 0,
            suspended: 0
        })
    }

    setWalletModel(wallet) {
        this.wallet = wallet;
        return this;
    }

    setHistoryModel(history) {
        this.history = history;
        return this;
    }

    setWalletData(data) {
        this.data = data;
        return this;
    }

    setTransaction(transaction) {
        this.transaction = transaction;
        return this;
    }

    getAmount() {
        return this.data.amount || 0;
    }

    getBlocked() {
        return this.data.blocked || 0;
    }

    getSuspended() {
        return this.data.suspended || 0;
    }

    getBalance() {
        return this.getAmount() -  (this.getBlocked() + this.getSuspended());
    }

    async fetchWallet() {
        this.setWalletData(await this.wallet.get())
    }

    async balance(amount, description, metadata = []) {
        await this.fetchWallet();
        if(this.transaction) metadata.push({ key: "transaction_id", value: this.transaction.id } )
        await this.history.setMetadata(metadata.concat([ { key: "wallet_id", value: this.data.id } ]))
            .create({
            amount, description, metadata,
            type: amount > 0 ? constants.wallet_action_type_credit : constants.wallet_action_type_debit,
            opening_balance: this.getBalance(),
            closing_balance: this.getBalance() + amount
        })
        return await this.wallet.update({
            amount: this.getAmount() + amount
        })
    }
    async credit(amount, description, metadata = []) {
        return this.balance(amount, description, metadata)
    }
    async debit(amount, description, metadata = []) {
        return this.balance(-1*amount, description, metadata)
    }
    async block(amount, description, metadata = []) {
        await this.fetchWallet();
        await this.history.setMetadata(metadata.concat([ {key: "wallet_id", value: this.data.id} ]))
            .create({
                amount, description, metadata,
                type: amount > 0 ? constants.wallet_action_type_block : constants.wallet_action_type_unblock,
                opening_balance: this.getBalance(),
                closing_balance: this.getBalance() - amount
            })
        return await this.wallet.update({
            blocked: this.getBlocked() + amount
        })
    }
    async unblock(amount, description, metadata = []) {
        return this.block(-1*amount, description, metadata)
    }
    async suspend(amount, description, metadata = []) {
        await this.fetchWallet();
        await this.history.setMetadata(metadata.concat([ {key: "wallet_id", value: this.data.id} ]))
            .create({
                amount, description, metadata,
                type: amount > 0 ? constants.wallet_action_type_suspend : constants.wallet_action_type_unsuspend,
                opening_balance: this.getBalance(),
                closing_balance: this.getBalance() - amount
            })
        return await this.wallet.update({
            suspended: this.getSuspended() + amount
        })
    }

    async unsuspend(amount, description, metadata = []) {
        return this.suspend(-1*amount, description, metadata)
    }

    async validateAmount(amount) {
        await this.fetchWallet();
        return this.getBalance() >= amount ;
    }
}

module.exports = WalletLedger