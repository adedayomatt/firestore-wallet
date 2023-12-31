const { FirestoreCollectionModel} = require("@adedayomatthews/firestore-model");
const Collections = require("../../../Collections");

class Entity extends FirestoreCollectionModel {
    constructor(db, collections = new Collections) {
        super(db.collection(collections.entityCollection()));
        this.db = db;
        this.collections = collections;
    }

    Wallets(id) {
        return new FirestoreCollectionModel(this.db.collection(this.documentRef.path + '/' + this.collections.entityWallets()))
            .setId(id)
    }

    Transactions(id) {
        return new FirestoreCollectionModel(this.db.collection(this.documentRef.path + '/' + this.collections.entityTransactions()))
            .setId(id)
    }

    WalletHistory(id) {
        return new FirestoreCollectionModel(this.db.collection(this.documentRef.path + '/' + this.collections.entityWalletHistory()))
            .setId(id)
    }

    WithdrawalRequests(id) {
        return new FirestoreCollectionModel(this.db.collection(this.documentRef.path + '/' + this.collections.entityWithdrawalRequests()))
            .setId(id)
    }

}

module.exports = Entity;