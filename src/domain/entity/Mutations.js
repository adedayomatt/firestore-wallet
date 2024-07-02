const status = require("../../enums/status");
const walletTypes = require("../../enums/wallet_types");
const PaystackWalletConnection = require("../../services/PaystackWalletConnection");
const StripeWalletConnection = require("../../services/StripeWalletConnection");
const RevolutWalletConnection = require("../../services/RevolutWalletConnection");
const WalletLedger = require("../../services/WalletLedger");
const WalletTransfer = require("../../services/WalletTransfer");
const Collections = require("../../Collections");
const Entity = require("./models/Entity")
const Integrations = require("../system/Integrations");
const EntityIntegrations = require("./Integrations");
const transactionTypes = require("../../enums/transaction_types");
const WalletPayout = require("../../services/WalletPayout");
const helper = require("../../helpers");
const WalletRegister = require("../../services/WalletRegister");

class EntityMutation {
    constructor(db, collections = new Collections()) {
        this.db = db;
        this.collections = collections;
        this.SystemIntegrations = new Integrations(db, collections)
    }

    async createEntity({ type, metadata }) {
        return await (new Entity(this.db, this.collections))
            .setMetadata(metadata || [])
            .create({ type });
    }
    async createWallet({ entity_id, wallet_type, parent_entity_id }) {
        const entity = (new Entity(this.db, this.collections)).setId(entity_id);
        const model = entity.Wallets()
        if(await model.getDocWithBuilder((query) => {
            if(parent_entity_id) {
                return query.where('type', '==', wallet_type)
                    .where('parent_entity_id', '==', parent_entity_id);
            }
            return query.where('type', '==', wallet_type);
        })) throw new Error("Wallet already exist");
        return await model.create({
            amount: 0,
            suspended: 0,
            blocked: 0,
            type: wallet_type,
            status: status.enabled,
            parent_entity_id
        })
    }
    
    async createWithdrawalRequest({ entity_id, wallet_id, data })  {
        const entity = (new Entity(this.db, this.collections)).setId(entity_id);
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

    async connectNgnWallet({ entity_id, wallet_id, account_details }) {
        const { account_name, account_number, bank_code } = account_details;
        const Wallets = (new Entity(this.db, this.collections)).setId(entity_id).Wallets();
        const ngnWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('id', '==', wallet_id)
                .where('type', '==', walletTypes.ngn.id);
        })
        if(!ngnWallet) throw new Error("NGN Wallet does not exist");
        const connection = await (new PaystackWalletConnection(ngnWallet))
            .setIntegrations(
                ngnWallet.parent_entity_id
                    ? new EntityIntegrations(this.db).setEntity((new Entity(this.db, this.collections)).setId(ngnWallet.parent_entity_id))
                    : this.SystemIntegrations
            )
            .connect(account_name, account_number, bank_code);
        return Wallets.setId(ngnWallet.id).set({ connection: JSON.stringify(connection) });
    }

    async disconnectNgnWallet({ entity_id, wallet_id }){
        const Wallets = (new Entity(this.db, this.collections)).setId(entity_id).Wallets();
        const ngnWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('id', '==', wallet_id)
                .where('type', '==', walletTypes.ngn.id);
        })
        if(!ngnWallet) throw new Error("NGN Wallet does not exist");
        await (new PaystackWalletConnection(ngnWallet))
            .setIntegrations(
                ngnWallet.parent_entity_id
                    ? new EntityIntegrations(this.db).setEntity((new Entity(this.db, this.collections)).setId(ngnWallet.parent_entity_id))
                    : this.SystemIntegrations
            )
            .disconnect();
        return Wallets.setId(ngnWallet.id).set({ connection: null });
    }

    async connectUsdWallet({ entity_id, wallet_id, authorization_code }) {
        const Wallets = (new Entity(this.db, this.collections)).setId(entity_id).Wallets();
        const usdWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('id', '==', wallet_id)
                .where('type', '==', walletTypes.usd.id);
        })
        if(!usdWallet) throw new Error("USD Wallet does not exist");
        const connection =  await (new StripeWalletConnection(usdWallet))
            .setIntegrations(
                usdWallet.parent_entity_id
                    ? new EntityIntegrations(this.db).setEntity((new Entity(this.db, this.collections)).setId(usdWallet.parent_entity_id))
                    : this.SystemIntegrations
            )
            .connect(authorization_code);
        return Wallets.setId(usdWallet.id).set({ connection: JSON.stringify(connection) });
    }

    async disconnectUsdWallet({ entity_id, wallet_id }){
        const Wallets = (new Entity(this.db, this.collections)).setId(entity_id).Wallets();
        const usdWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('id', '==', wallet_id)
                .where('type', '==', walletTypes.usd.id);
        })
        if(!usdWallet) throw new Error("USD Wallet does not exist");
        await (new StripeWalletConnection(usdWallet))
            .setIntegrations(
                usdWallet.parent_entity_id
                    ? new EntityIntegrations(this.db).setEntity((new Entity(this.db, this.collections)).setId(usdWallet.parent_entity_id))
                    : this.SystemIntegrations
            )
            .disconnect();
        return Wallets.setId(usdWallet.id).set({ connection: null });
    }

    async connectGbpWallet({ entity_id, wallet_id, account_details }){
        const Wallets = (new Entity(this.db, this.collections)).setId(entity_id).Wallets();
        const gbpWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('id', '==', wallet_id)
                .where('type', '==', walletTypes.gbp.id);
        })
        if(!gbpWallet) throw new Error("GBP Wallet does not exist");
        const connection =  await (new RevolutWalletConnection(gbpWallet))
            .setIntegrations(
                gbpWallet.parent_entity_id
                    ? new EntityIntegrations(this.db).setEntity((new Entity(this.db, this.collections)).setId(gbpWallet.parent_entity_id))
                    : this.SystemIntegrations
            )
            .connect(account_details)
        return Wallets.setId(gbpWallet.id).set({ connection: JSON.stringify(connection) });
    }

    async disconnectGbpWallet({ entity_id }){
        const Wallets = (new Entity(this.db, this.collections)).setId(entity_id).Wallets();
        const gbpWallet = await Wallets.getDocWithBuilder((query) => {
            return query.where('id', '==', wallet_id)
                .where('type', '==', walletTypes.gbp.id);
        })
        if(!gbpWallet) throw new Error("GBP Wallet does not exist");
        await (new RevolutWalletConnection(gbpWallet))
            .setIntegrations(
                gbpWallet.parent_entity_id
                    ? new EntityIntegrations(this.db).setEntity((new Entity(this.db, this.collections)).setId(gbpWallet.parent_entity_id))
                    : this.SystemIntegrations
            )
            .disconnect();
        return Wallets.setId(gbpWallet.id).set({ connection: null });
    }

    async walletTransfer({ data }) {
        const { from, to, amount, comment, metadata } = data;
        const fromEntity = (new Entity(this.db, this.collections)).setId(from.entity_id);
        const toEntity = (new Entity(this.db, this.collections)).setId(to.entity_id);
        const sender = await fromEntity.get();

        return new WalletTransfer(this.db, this.collections)
            .setOriginEntity(fromEntity)
            .setOriginWallet(fromEntity.Wallets(from.wallet_id))
            .setDestinationEntity(toEntity)
            .setDestinationWallet(toEntity.Wallets(to.wallet_id))
            .setMetadata(metadata)
            .transfer(amount, comment)
    }
    async setEntityIntegrations({ entity_id, integrations }) {
        const entity = (new Entity(this.db, this.collections)).setId(entity_id);
        return await entity.update({ integrations })
    }

    async setWalletIntegration({ entity_id, wallet_id, integration_ref }) {
        const entity = (new Entity(this.db, this.collections)).setId(entity_id);
        return await entity.Wallets(wallet_id).update({ integration_ref })
    }
}

module.exports = EntityMutation;