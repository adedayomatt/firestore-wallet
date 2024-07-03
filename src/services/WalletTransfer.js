const moment = require("moment");
const WalletLedger = require("./WalletLedger");
const transactionTypes = require("../enums/transaction_types");
const status = require("../enums/status");
const WalletPayout = require("./WalletPayout");
const EntityIntegrations = require("../domain/entity/Integrations");
const helper = require("../helpers");
const Integrations = require("../domain/system/Integrations");

class WalletTransfer {

    constructor(db, collection) {
        this.db = db;
    }

    setOriginEntity(entity) {
        this.originEntity = entity;
        return this;
    }

    getOriginEntity() {
        return this.originEntity;
    }

    setOriginWallet(wallet) {
        this.originWallet = wallet;
        return this;
    }

    getOriginWallet() {
        return this.originWallet;
    }

    setDestinationEntity(entity) {
        this.destinationEntity = entity;
        return this;
    }

    getDestinationEntity() {
        return this.destinationEntity;
    }

    setDestinationWallet(wallet) {
        this.destinationWallet = wallet;
        return this;
    }

    getDestinationWallet() {
        return this.destinationWallet;
    }

    getOriginLedger() {
        return new WalletLedger()
            .setWalletModel(this.originWallet)
            .setHistoryModel(this.originEntity.WalletHistory())
    }

    getDestinationLedger() {
        return new WalletLedger()
            .setWalletModel(this.destinationWallet)
            .setHistoryModel(this.destinationEntity.WalletHistory())
    }

    setMetadata(metadata = []) {
        this.metadata = metadata;
        return this;
    }

    setIntegrations(integrations = new Integrations) {
        this.integrations = integrations;
        return this;
    }

    getMetadata() {
        return this.metadata || [];
    }

    async validate() {
        const originWallet = await this.originWallet.get();
        const destinationWallet = await this.destinationWallet.get();
        if(!(originWallet && destinationWallet)) throw new Error("Invalid wallets")
        if(originWallet.type !== destinationWallet.type)
            throw new Error("Incompatible wallets")
    }

    getTransactionMetaData() {
        return this.getMetadata().concat([
            { key: "to_entity_id", value: this.destinationEntity.getId() },
            { key: "to_wallet_id", value: this.destinationWallet.getId() },
            { key: "from_entity_id", value: this.originEntity.getId() },
            { key: "from_wallet_id", value: this.originWallet.getId() }
        ])
    }

    async transfer(amount, description) {
        const sender = await this.originEntity.get()
        const receiver = await this.destinationEntity.get()
        if(sender.type === "business") {
            return await this.bankTransfer(amount, description);
        }
        await this.validate();
        if(!(await this.getOriginLedger().validateAmount(amount)))
            throw new Error("Insufficient amount");

        const transactionData = {
            title: "Wallet Transfer",
            type: transactionTypes.transfer,
            description: description,
            date: moment().toISOString(),
            amount: amount,
            status: status.success
        }
        const debit = await this.debitOrigin(transactionData);
        const credit = await this.creditDestination(transactionData);
        return debit;
    }

    async bankTransfer(amount, description) {
            const metadata = this.getTransactionMetaData();
            const transactionData = {
                amount: amount,
                date: moment().format("YYYY-MM-DD"),
                title: "Fund Transfer",
                description:`TRSF | ${description}`,
                type: transactionTypes.transfer,
                status: status.pending
            }
            const debit = await this.debitOrigin(transactionData);
            const credit = await this.creditDestination(transactionData);
            try {
                await new WalletPayout(this.getDestinationWallet())
                    .setIntegrations(new EntityIntegrations(this.db).setEntity(this.originEntity))
                    .setModel(this.destinationWallet)
                    .setAmount(credit.amount)
                    .setMetadata(helper.convertMetaKeyValueToObj(
                        metadata.concat([{ key: "transaction_id", value: credit.id }])
                    ))
                    .setReference(`${this.destinationEntity.getId()}-T-${credit.id}`.toLowerCase())
                    .setDescription(credit.description)
                    .setTransaction(this.destinationEntity.Transactions(credit.id))
                    .payout();

                await this.getDestinationLedger()
                    .setTransaction(this.destinationEntity.Transactions(credit.id))
                    .debit(credit.amount, credit.description);

                await this.destinationEntity.Transactions(credit.id)
                    .set({ status: status.success })

                return await this.originEntity.Transactions(debit.id)
                    .set({ status: status.success })
            } catch (e) {
                await this.destinationEntity.Transactions(credit.id)
                    .setMetadata([{ key: "error", value: e.message }])
                    .set({ status: status.failed })

                return await this.originEntity.Transactions(debit.id)
                    .setMetadata([{ key: "error", value: e.message }])
                    .set({ status: status.failed })
            }
    }

    async debitOrigin(transactionData) {
        const { amount, description } = transactionData;

        const transaction = await this.getOriginEntity().Transactions()
            .setMetadata([{ key: "wallet_id", value: this.getOriginWallet().getId() }].concat(this.getTransactionMetaData()))
            .create({...transactionData, outflow: amount})

        try {
            await this.getOriginLedger()
                .setTransaction(transaction)
                .debit(amount, description, this.getTransactionMetaData());
            return transaction;
        } catch (e) {
            return await this.getOriginEntity().Transactions(transaction.id).set({
                status: status.failed
            })
        }
    }

    async creditDestination(transactionData) {
        const { amount, description } = transactionData;

        const transaction = await this.getDestinationEntity().Transactions()
            .setMetadata([{ key: "wallet_id", value: this.getDestinationWallet().getId() }].concat(this.getTransactionMetaData()))
            .create({...transactionData, inflow: amount})

        try {
            await this.getDestinationLedger()
                .setTransaction(transaction)
                .credit(amount, description, this.getTransactionMetaData());
            return transaction
        } catch (e) {
            return await this.getDestinationEntity().Transactions(transaction.id).set({
                status: status.failed
            })
        }
    }
}

module.exports = WalletTransfer;