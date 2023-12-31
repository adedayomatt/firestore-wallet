const { FirestoreCollectionGroupModel} = require("@adedayomatthews/firestore-model");
const Collections = require("../../../Collections");

class EntityTransaction extends FirestoreCollectionGroupModel {

    constructor(db, collections = new Collections) {
        super(db.collectionGroup(collections.entityTransactions()));
    }

}

module.exports = EntityTransaction