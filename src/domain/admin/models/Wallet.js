const {FirestoreCollectionModel} = require("@adedayomatthews/firestore-model");
const Collections = require("../../../Collections");

class Wallet extends FirestoreCollectionModel {

    constructor(db, collections = new Collections) {
        super(db.collection(collections.adminWallets()));
        this.db = db;
        this.collections = collections;
    }

    History(id){
        return new FirestoreCollectionModel(this.db.collection(this.documentRef.path+'/'+this.collections.adminWalletHistory()))
            .setId(id);
    }
}

module.exports = Wallet