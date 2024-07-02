const status = require("../../enums/status");
const Collections = require("../../Collections");
const Entity = require("./models/Entity");

class EntityQueries {
    constructor(db, collections = new Collections()) {
        this.db = db;
        this.collections = collections;
    }

    getEntity({ entity_id }) {
        return (new Entity(this.db, this.collections)).setId(entity_id).get()
    }

     getTransactions({ entity_id, wallet_id }) {
        return (new Entity(this.db, this.collections)).setId(entity_id)
            .Transactions()
            .getCollectionWithBuilder(query => {
                query = wallet_id ? query.where("metadata.wallet_id", "==", wallet_id) : query
                return query.orderBy("timestamp.created_at", "desc");
            })
    }

    getWithdrawalRequests({ entity_id, wallet_id }) {
        return (new Entity(this.db, this.collections)).setId(entity_id)
            .WithdrawalRequests()
            .getCollectionWithBuilder(query => {
                query = wallet_id ? query.where("metadata.wallet_id", "==", wallet_id) : query
                return query
                    .orderBy('status')
                    .where("status", 'not-in', [status.approved])
                    .orderBy("timestamp.created_at", "desc");
            })
    }
}

module.exports = EntityQueries