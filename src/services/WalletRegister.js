const AdminWallet = require("../domain/admin/models/Wallet");
const WalletLedger = require("./WalletLedger");
const Collections = require("../Collections");

class WalletRegister {

    constructor(db, collections = new Collections) {
        this.AdminWallets = new AdminWallet(db, collections);
    }

    setWallet(wallet) {
        this.wallet = wallet;
        return this;
    }

    setWalletHistory(history) {
        this.history = history;
        return this;
    }

    setAdminWallet(wallet){
        this.adminWallet = wallet;
        return this;
    }

    setTransaction(transaction) {
        this.transaction = transaction;
        return this;
    }

    getLedger() {
        return new WalletLedger()
            .setWalletModel(this.wallet)
            .setHistoryModel(this.history)
            .setTransaction(this.transaction)
    }

    getAdminLedger() {
        return new WalletLedger()
            .setWalletModel(this.adminWallet)
            .setHistoryModel(this.adminWallet.History())
            .setTransaction(this.transaction)
    }

    async fetchAdminWallet() {
        const wallet = await this.wallet.get();
        if(!wallet) throw new Error("Wallet not found")
        const adminWallet = await this.AdminWallets.getDocWithBuilder(query => {
            return query.where("type", "==", wallet.type)
        });
        if(!adminWallet) throw new Error("Oops, can't complete transaction at the moment")
        this.setAdminWallet(this.AdminWallets.setId(adminWallet.id));
    }

    async balance(amount, description, metadata = []) {
        if(!this.adminWallet) await this.fetchAdminWallet();

        const response = await this.getLedger().balance(amount, description, [
                { key: "admin_wallet_id", value: this.adminWallet.getId() }
            ].concat(metadata));

        await this.getAdminLedger().balance(amount, description, [
                { key: "destination_wallet_id", value: this.wallet.getId() }
            ].concat(metadata));

        return response;
    }

    async credit(amount, description, metadata = []) {
        return await this.balance(amount, description, metadata = []);
    }

    async debit(amount, description, metadata = []) {
        return await this.balance(-1 * amount, description, metadata = []);
    }

}

module.exports = WalletRegister;