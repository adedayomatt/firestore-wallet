const { FirestoreCollectionModel} = require("@adedayomatthews/firestore-model");
const Collections = require("../../../Collections");
const Util = require("@adedayomatthews/utility");
const AdminCollectionWallet = require("../../admin/models/CollectionWallet")

class System extends FirestoreCollectionModel {
    constructor(db, collections = new Collections) {
        super(db.collection(collections.system()));
        this.db = db;
        this.collections = collections;
    }

    Admins() {
        return this.setId(this.collections.systemAdmins())
    }

    Integration(id) {
        return new FirestoreCollectionModel(this.db.collection(this.collections.systemIntegrations())).setId(id)
    }

    FeeCollectionConfig() {
        return this.setId(this.collections.systemFeeWalletConfig())
    }

    async getCurrencyCollectionWallet (currency, wallet) {
        let collectionWallet = new AdminCollectionWallet(this.db, this.collections);
        let config = await this.FeeCollectionConfig().get();
        if(config && config[currency] && config[currency][wallet]) {
            collectionWallet = collectionWallet.setId((config[currency][wallet]));
            if(await collectionWallet.exist()) return collectionWallet
        }
        const defaultWallet = await collectionWallet.create({
            name: `${currency.toUpperCase()} ${wallet.replaceAll('_',' ')}`,
            amount: 0,
            type: currency
        })
        config = Util._setObjectItem(config, `${currency}.${wallet}`, defaultWallet.id)
        delete config.timestamp;
        await this.FeeCollectionConfig()
            .createOrUpdate(config);
        return collectionWallet;
    }

}

module.exports = System;