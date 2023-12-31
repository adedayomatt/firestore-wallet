const { FirestoreCollectionGroupModel} = require("@adedayomatthews/firestore-model");
const Collections = require("../../../Collections");

class EntityWithdrawalRequest extends FirestoreCollectionGroupModel {
    constructor(db, collections = new Collections) {
        super(db.collectionGroup(collections.entityWithdrawalRequests()));
    }
}

module.exports = EntityWithdrawalRequest