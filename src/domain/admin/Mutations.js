const moment = require("moment");
const WalletPayout = require("../../services/WalletPayout");
const WalletRegister = require("../../services/WalletRegister");
const WalletLedger = require("../../services/WalletLedger");
const TransactionFeeHandler = require("../../services/TransactionFeeHandler");
const TransactionGetter =  require("../entity/getters/Transaction");
const status = require("../../enums/status");
const walletTypes = require("../../enums/wallet_types");
const transactionTypes = require("../../enums/transaction_types");
const helper = require("../../helpers");
const Collections = require("../../Collections");
const EntityModel = require("../entity/models/Entity");
const System = require("../system/models/System");
const AdminWallet = require("./models/Wallet");
const AdminCollectionWallet = require("./models/CollectionWallet");
const Integrations = require("../system/Integrations");
const Entity = require("../entity/models/Entity");

class AdminMutations {
    constructor(db, collections = new Collections) {
        this.db = db
        this.collections = collections;
        this.AdminWallets = new AdminWallet(db, collections);
        this.AdminCollectionWallets = new AdminCollectionWallet(db, collections);
        this.system = new System(db, collections);
        this.integrations = new Integrations(db, collections)
    }

    async createAdminWallet({ wallet_type }) {
        if(!Object.keys(walletTypes).includes(wallet_type)) throw new Error("Invalid wallet type")
        if(await this.AdminWallets.getDocWithBuilder((query) => {
            return query.where('type', '==', wallet_type);
        })) throw new Error("Wallet already exist");
        return await this.AdminWallets.create({
            amount: 0,
            type: wallet_type,
            status: status.enabled
        })
    }

    async createAdminCollectionWallet({ name, type }) {
        if(!Object.keys(walletTypes).includes(type)) throw new Error("Invalid wallet type")
        if(await this.AdminCollectionWallets.getDocWithBuilder((query) => {
            return query.where('name', '==', name).where('type', '==', type);
        })) throw new Error("Wallet name already exist, choose a different name");
        return await this.AdminCollectionWallets.setMetadata([])
            .create({
                name, type,
                amount: 0,
                status: status.enabled
            })
    }

    async createTransaction( { entity_id, wallet_id, data } ){
        const Entity = (new EntityModel(this.db, this.collections)).setId(entity_id);
        const Wallet = Entity.Wallets(wallet_id);

        const transaction = await Entity.Transactions()
            .setMetadata((data.metadata || []).concat([
                { key: this.collections.entityIdentifierKey(), value: Entity.getId() },
            ]))
            .create({ ...data, status: status.success });
        try {
            await new WalletRegister(this.db, this.collections)
                .setWallet(Wallet)
                .setWalletHistory(Entity.WalletHistory())
                .setTransaction(Entity.Transactions(transaction.id))
                .balance(TransactionGetter.net(transaction), transaction.description, [
                    { key: this.collections.entityIdentifierKey(), value: Entity.getId() },
                    { key: "transaction_id", value: transaction.id }
                ]);
            await new TransactionFeeHandler(transaction)
                .setSystem(this.system)
                .setFees(["Management_Fee", "Tax_Fee", "Payment_Processing_Fee", "Cleaning_Fee"])
                .setMetadata([
                    { key: this.collections.entityIdentifierKey(), value: Entity.getId() }
                ])
                .setWallet(await Wallet.get())
                .apply()
            return transaction;
        } catch (e) {
            if(transaction) {
                await Entity.Transactions(transaction.id).update({ status: status.failed })
            }
            throw e;
        }
    }

    async updateTransaction( { entity_id, transaction_id, data }){
        const Entity = (new EntityModel(this.db, this.collections)).setId(entity_id)
        return Entity.Transactions(transaction_id)
            .setMetadata((data.metadata || []))
            .update(data);
    }

    async fundWallet({ entity_id, entity_wallet_id: wallet_id, admin_wallet_id, data }){
        const Entity = (new EntityModel(this.db, this.collections)).setId(entity_id);
        const Wallet = Entity.Wallets(wallet_id);
        const AdminWallet = this.AdminWallets.setId(admin_wallet_id);

        const [entityWalletData, adminWalletData] = await Promise.all([Wallet.get(), AdminWallet.get()]);
        if(!entityWalletData) throw new Error("Invalid wallet");
        if(!adminWalletData) throw new Error("Invalid admin wallet");

        if(entityWalletData.type !== adminWalletData.type) throw new Error("Can't exchange fund between wallets");
        const transactionMetadata = (data.metadata || []).concat([
            { key: "wallet_id", value: Wallet.getId() },
            { key: this.collections.entityIdentifierKey(), value: Entity.getId() }
        ]);

        const transactionData = {
            title: "Wallet Funding",
            type: transactionTypes.funding,
            description: data.comment,
            date: moment().format("YYYY-MM-DD"),
            amount: data.amount,
            status: status.success
        }

        const transaction = await Entity.Transactions()
            .setMetadata(transactionMetadata)
            .create(transactionData);

        const fundedWallet = await new WalletRegister(this.db, this.collections)
            .setWallet(Wallet)
            .setWalletHistory(Entity.WalletHistory())
            .setAdminWallet(AdminWallet)
            .setTransaction(Entity.Transactions(transaction.id))
            .credit(data.amount, data.comment, (data.metadata || []).concat([
                { key: this.collections.entityIdentifierKey(), value: Entity.getId() },
            ]))

        if(data.send_to_bank) {
            const payoutTransaction = await Entity.Transactions()
                .setMetadata(transactionMetadata)
                .create({
                    ...transactionData,
                    title: "Withdrawal of Fund",
                    description:`Withdrawal | ${data.comment}`,
                    type: transactionTypes.payout
                });
            try {
                await new WalletPayout(fundedWallet)
                    .setIntegrations(this.integrations)
                    .setModel(Wallet)
                    .setAmount(payoutTransaction.amount)
                    .setMetadata(helper.convertMetaKeyValueToObj(
                        transactionMetadata.concat([{ key: "transaction_id", value: payoutTransaction.id }])
                    ))
                    .setReference(`${this.collections.entity()}-${Entity.getId()}-T-${payoutTransaction.id}`.toLowerCase())
                    .setDescription(payoutTransaction.description)
                    .setTransaction(Entity.Transactions(payoutTransaction.id))
                    .payout()

                return await new WalletRegister(this.db, this.collections)
                    .setWallet(Wallet)
                    .setWalletHistory(Entity.WalletHistory())
                    .setAdminWallet(AdminWallet)
                    .setTransaction(Entity.Transactions(payoutTransaction.id))
                    .debit(data.amount, data.comment, (data.metadata || []).concat([
                        { key: this.collections.entityIdentifierKey(), value: Entity.getId() },
                    ]))
            } catch (e) {
                await Entity.Transactions(payoutTransaction.id)
                    .setMetadata([{ key: "error", value: e.message }])
                    .set({ status: status.failed })
            }
        }

        return fundedWallet;
    }

    async reviewWithdrawalRequest({ entity_id, request_id, data } ){
        const Entity = (new EntityModel(this.db, this.collections)).setId(entity_id);

        let request = await Entity.WithdrawalRequests().getDocWithBuilder(q => {
            return q.where("id", "==", request_id).where("status", "==", status.pending)
        });
        if(!request) throw new Error("Invalid withdrawal request");

        const Wallet = Entity.Wallets(request._metadata.wallet_id)
        data.reviewed_at = moment().unix();
        request = await Entity.WithdrawalRequests(request_id).set({
            amount_approved: data.amount || 0,
            status: data.status,
            review: data,
        })
        /**
         * TODO: Verify that requested amount was suspended first and get the amount to unsuspend from there
         */
        await new WalletLedger()
            .setWalletModel(Wallet)
            .setHistoryModel(Entity.WalletHistory())
            .unsuspend(request.amount, "Approval of withdrawal request", [
                { key: "request_id", value: request.id }
            ])

        if(request.status === status.approved) {
            const transactionMetadata = [
                { key: "request_id", value: request.id },
                { key: "wallet_id", value: Wallet.getId() },
                { key: this.collections.entityIdentifierKey(), value: Entity.getId() },
            ];
            const transactionData = {
                title: "Withdrawal",
                type: transactionTypes.payout,
                description: `Withdrawal approval | Req ID: ${request.id}`,
                date: moment().format("YYYY-MM-DD"),
                amount: request.amount_approved,
                status: status.success
            }
            const transaction = await Entity.Transactions()
                .setMetadata(transactionMetadata)
                .create(transactionData);

            await Entity.WithdrawalRequests(request_id).setMetadata([
                { key: "transaction_id", value: transaction.id }
            ]).set();

            let payout = null;
            let amountToBalance = TransactionGetter.net(transaction);
            try {
                if(amountToBalance < 0) {
                    payout = await new WalletPayout(await Wallet.get())
                        .setIntegrations(this.integrations)
                        .setModel(Wallet)
                        .setAmount(Math.abs(amountToBalance))
                        .setMetadata(helper.convertMetaKeyValueToObj(
                            transactionMetadata.concat([{ key: "transaction_id", value: transaction.id }])
                        ))
                        .setReference(`${this.collections.entity()}-${Entity.getId()}-T-${transaction.id}`.toLowerCase())
                        .setDescription(transaction.description)
                        .setTransaction(Entity.Transactions(transaction.id))
                        .payout()
                }
                await new WalletRegister(this.db, this.collections)
                    .setWallet(Wallet)
                    .setWalletHistory(Entity.WalletHistory())
                    .setTransaction(Entity.Transactions(transaction.id))
                    .balance(TransactionGetter.net(transaction), transaction.description, [
                        {key: this.collections.entityIdentifierKey(), value: entity_id},
                        {key: "request_id", value: request_id},
                    ]);
            } catch (e) {
                if(transaction) {
                    await Entity.Transactions(transaction.id)
                        .setMetadata([{ key: "error", value: e.message }])
                        .set({ status: status.failed })
                }
                throw e;
            }
        }
        return request
    }
}

module.exports = AdminMutations