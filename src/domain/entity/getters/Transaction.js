const TransactionGetter = require("../../../Services/TransactionGetter")
const Collections = require("../../../Collections");
const Getter = require("../../../Getter");

class EntityTransactionGetter extends Getter{
    constructor(db, collections = new Collections()) {
        super(db, collections)
    }

    async getWallet(txn) {
        if(txn._metadata.wallet_id) {
            return await this.entity.setId(txn._metadata[this.collections.entityIdentifierKey()])
                .Wallets(txn._metadata.wallet_id).get()
        }
        return null;
    }

    async getEntity(txn) {
        if(txn._metadata[this.collections.entityIdentifierKey()]) {
            return await this.entity.setId(txn._metadata[this.collections.entityIdentifierKey()])
                .get()
        }
        return null;
    }

    static amount(txn) {
        return new TransactionGetter(txn).getAmount()
    }

    static inflow(txn) {
        return new TransactionGetter(txn).getTotalInflow()
    }

    static outflow(txn) {
        return new TransactionGetter(txn).getTotalOutflow()
    }

    static fees_total(txn) {
        return new TransactionGetter(txn).getTotalFee()
    }

    static extra_fees_income(txn) {
        return new TransactionGetter(txn).getExtraFeeInflow()
    }

    static extra_fees_expense(txn) {
        return new TransactionGetter(txn).getExtraFeeOutflow()
    }

    static extra_fees_net(txn) {
        return new TransactionGetter(txn).getExtraFeeNet()
    }

    static net(txn) {
        return new TransactionGetter(txn).getNet()
    }

    getters() {
        return {
            wallet: async txn => await this.getWallet(txn),
            entity: async txn => await this.getEntity(txn),
            amount: txn => EntityTransactionGetter.amount(txn),
            inflow: txn => EntityTransactionGetter.inflow(txn),
            outflow: txn => EntityTransactionGetter.outflow(txn),
            fees_total: txn => EntityTransactionGetter.fees_total(txn),
            extra_fees_income: txn => EntityTransactionGetter.extra_fees_income(txn),
            extra_fees_expense: txn => EntityTransactionGetter.extra_fees_expense(txn),
            extra_fees_net: txn => EntityTransactionGetter.extra_fees_net(txn),
            net: txn => EntityTransactionGetter.net(txn),
        }
    }

}


module.exports = EntityTransactionGetter;