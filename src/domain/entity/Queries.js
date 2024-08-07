const status = require("../../enums/status");
const Collections = require("../../Collections");
const Entity = require("./models/Entity");

class EntityQueries {
    constructor(db, collections = new Collections()) {
        this.db = db;
        this.collections = collections;
    }

    getEntity({ entity_id }) {
        return (new Entity(this.db, this.collections))
            .setId(entity_id)
            .get()
    }

    getWallets({ entity_id }) {
        return (new Entity(this.db, this.collections))
            .setId(entity_id)
            .Wallets()
            .all()
    }

    getWallet({ entity_id, wallet_type }) {
        return (new Entity(this.db, this.collections))
            .setId(entity_id)
            .Wallets()
            .getDocWithBuilder(q => q.where('type', '==', wallet_type))
    }

     getTransactions({ entity_id, wallet_id, limit, offset }) {
        return (new Entity(this.db, this.collections))
            .setId(entity_id)
            .Transactions()
            .getCollectionWithBuilder(query => {
                query = wallet_id ? query.where("metadata.wallet_id", "==", wallet_id) : query;
                query = query.orderBy("timestamp.created_at", "desc");
                query = limit ? query.limit(limit) : query;
                query = offset ? query.offset(offset) : query;
                return query;
            })
    }

    getTransaction({ entity_id, wallet_id, transaction_id }) {
        return (new Entity(this.db, this.collections))
            .setId(entity_id)
            .Transactions(transaction_id)
            .get();
    }

    getWithdrawalRequests({ entity_id, wallet_id, limit, offset }) {
        return (new Entity(this.db, this.collections))
            .setId(entity_id)
            .WithdrawalRequests()
            .getCollectionWithBuilder(query => {
                query = wallet_id ? query.where("metadata.wallet_id", "==", wallet_id) : query
                query =  query
                    .orderBy('status')
                    .where("status", 'not-in', [status.approved])
                    .orderBy("timestamp.created_at", "desc");
                query = limit ? query.limit(limit) : query;
                query = offset ? query.offset(offset) : query;
                return query;
            })
    }
}

module.exports = EntityQueries