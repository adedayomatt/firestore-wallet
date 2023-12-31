const status = require("../../enums/status");
const walletTypes = require("../../enums/wallet_types");
const PaystackWalletConnection = require("../../services/PaystackWalletConnection");
const StripeWalletConnection = require("../../services/StripeWalletConnection");
const RevolutWalletConnection = require("../../services/RevolutWalletConnection");
const WalletLedger = require("../../services/WalletLedger");
const Collections = require("../../Collections");
const Entity = require("./models/Entity")
const Integrations = require("../system/Integrations");

class EntityMutation {
    constructor(db, collections = new Collections()) {
        this.db = db;
        this.collections = collections;
        this.entity = new Entity(db, collections)
        this.integrations = new Integrations(db, collections)
    }

    async createWallet({ entity_id, wallet_type }) {
        const entity = this.entity.setId(entity_id);
        const model = entity.Wallets()
        if(await model.getDocWithBuilder((query) => {
            return query.where('type', '==', wallet_type);
        })) throw new Error("Wallet already exist");
        return await model.create({
            amount: 0,
            suspended: 0,
            blocked: 0,
            type: wallet_type,
            status: status.enabled
        })
    }
    
    async createWithdrawalRequest({ entity_id, wallet_id, data })  {
        const entity = this.entity.setId(entity_id);
        const wallet = await entity.Wallets(wallet_id).get();
        if(!wallet) throw new Error("Invalid wallet");
        const ledger = new WalletLedger()
            .setWalletModel(entity.Wallets(wallet_id))
            .setHistoryModel(entity.WalletHistory());
        if(!await ledger.validateAmount(data.amount)) throw new Error("Wallet balance is less than withdrawal amount");
        const request = await entity.WithdrawalRequests()
            .setMetadata((data.metadata || []).concat([
                { key: "wallet_id", value: wallet_id },
                { key: this.collections.entityIdentifierKey(), value: entity.getId() },
            ])).create({ ...data, status: status.pending });
        await ledger.suspend(data.amount, `Withdrawal request`, [
            { key: "request_id", value: request.id },
            { key: this.collections.entityIdentifierKey(), value: entity.getId() },
        ])
        return request;
    }

    async connectNgnWallet({ entity_id, name, account_number, bank_code }) {
        const Wallets = this.entity.setId(entity_id).Wallets();
        const ngnWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('type', '==', walletTypes.ngn.id);
        })
        if(!ngnWallet) throw new Error("NGN Wallet does not exist");
        const connection = await (new PaystackWalletConnection(ngnWallet))
            .setIntegrations(this.integrations)
            .connect(name, account_number, bank_code);
        return Wallets.setId(ngnWallet.id).set({ connection: JSON.stringify(connection) });
    }

    async disconnectNgnWallet({ entity_id }){
        const Wallets = this.entity.setId(entity_id).Wallets();
        const ngnWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('type', '==', walletTypes.ngn.id);
        })
        if(!ngnWallet) throw new Error("NGN Wallet does not exist");
        await (new PaystackWalletConnection(ngnWallet))
            .setIntegrations(this.integrations)
            .disconnect();
        return Wallets.setId(ngnWallet.id).set({ connection: null });
    }

    async connectUsdWallet({ entity_id, authorization_code }) {
        const Wallets = this.entity.setId(entity_id).Wallets();
        const usdWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('type', '==', walletTypes.usd.id);
        })
        if(!usdWallet) throw new Error("USD Wallet does not exist");
        const connection =  await (new StripeWalletConnection(usdWallet))
            .setIntegrations(this.integrations)
            .connect(authorization_code);
        return Wallets.setId(usdWallet.id).set({ connection: JSON.stringify(connection) });
    }

    async disconnectUsdWallet({ entity_id }){
        const Wallets = this.entity.setId(entity_id).Wallets();
        const usdWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('type', '==', walletTypes.usd.id);
        })
        if(!usdWallet) throw new Error("USD Wallet does not exist");
        await (new StripeWalletConnection(usdWallet))
            .setIntegrations(this.integrations)
            .disconnect();
        return Wallets.setId(usdWallet.id).set({ connection: null });
    }

    async connectGbpWallet({ entity_id, account_details }){
        const Wallets = this.entity.setId(entity_id).Wallets();
        const gbpWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('type', '==', walletTypes.gbp.id);
        })
        if(!gbpWallet) throw new Error("GBP Wallet does not exist");
        const connection =  await (new RevolutWalletConnection(gbpWallet))
            .setIntegrations(this.integrations)
            .connect(account_details)
        return Wallets.setId(gbpWallet.id).set({ connection: JSON.stringify(connection) });
    }

    async disconnectGbpWallet({ entity_id }){
        const Wallets = this.entity.setId(entity_id).Wallets();
        const gbpWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('type', '==', walletTypes.gbp.id);
        })
        if(!gbpWallet) throw new Error("GBP Wallet does not exist");
        await (new RevolutWalletConnection(gbpWallet))
            .setIntegrations(this.integrations)
            .disconnect();
        return Wallets.setId(gbpWallet.id).set({ connection: null });
    }
}

module.exports = EntityMutation;