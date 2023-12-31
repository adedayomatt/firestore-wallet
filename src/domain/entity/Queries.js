const status = require("../../enums/status");
const Collections = require("../../Collections");
const Entity = require("./models/Entity");

class EntityQueries {
    constructor(db, collections = new Collections()) {
        this.entity = new Entity(db, collections)
    }

     getTransactions({ entity_id, wallet_id }) {
        return this.entity.setId(entity_id)
            .Transactions()
            .getCollectionWithBuilder(query => {
                query = wallet_id ? query.where("metadata.wallet_id", "==", wallet_id) : query
                return query.orderBy("timestamp.created_at", "desc");
            })
    }

    getWithdrawalRequests({ entity_id, wallet_id }) {
        return this.entity.setId(entity_id)
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