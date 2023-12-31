const { FirestoreCollectionModel} = require("@adedayomatthews/firestore-model");
const Collections = require("../../../Collections");

class CollectionWallet extends FirestoreCollectionModel {

    constructor(db, collections = new Collections) {
        super(db.collection(collections.adminCollectionWallets()));
        this.db = db;
        this.collections = collections;
    }

    History(id){
        return new FirestoreCollectionModel(this.db.collection(this.documentRef.path+'/'+this.collections.adminCollectionWalletHistory()))
            .setId(id);
    }
}

module.exports = CollectionWallet