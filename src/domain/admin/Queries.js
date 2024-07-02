const Collections = require("../../Collections");
const status = require("../../enums/status");
const Entity = require("../entity/models/Entity");
const EntityTransaction = require("../entity/models/Transaction");
const EntityWithdrawalRequest = require("../entity/models/WithdrawalRequest");
const AdminWallet = require("./models/Wallet");
const AdminCollectionWallet = require("./models/CollectionWallet");

class AdminQueries {
    constructor(db, collections = new Collections) {
        this.db = db
        this.collections = collections;
    }

     getAllTransactions() {
        return new EntityTransaction(this.db, this.collections)
            .getCollectionWithBuilder(query => {
            return query.orderBy("timestamp.created_at", "desc")
        });
    }

     getAllWithdrawalRequests() {
        return new EntityWithdrawalRequest(this.db, this.collections)
            .getCollectionWithBuilder(query => {
            return query
                .orderBy('status')
                .where("status", 'not-in', [status.approved])
                .orderBy("timestamp.created_at", "desc")
        });
    }

    getAdminWallets({ id, type }){
        return new AdminWallet(this.db, this.collections)
            .getCollectionWithBuilder(q => {
                q = type ? q.where("type", "==", type) : q;
                q = id ? q.where("id", "==", id) : q;
                return q;
        })
    }

    getAdminCollectionWallets({ id, type }) {
        return new AdminCollectionWallet(this.db, this.collections)
            .getCollectionWithBuilder(q => {
                q = type ? q.where("type", "==", type) : q;
                q = id ? q.where("id", "==", id) : q;
            return q;
        })
    }
}

module.exports = AdminQueries
