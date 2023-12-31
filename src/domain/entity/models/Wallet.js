const { FirestoreCollectionGroupModel} = require("@adedayomatthews/firestore-model");
const Collections = require("../../../Collections");

class EntityWallet extends FirestoreCollectionGroupModel {

    constructor(db, collections = new Collections) {
        super(db.collectionGroup(collections.entityWallets()),);
    }

}

module.exports = EntityWallet