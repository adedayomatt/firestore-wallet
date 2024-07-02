const Collections = require("../../../Collections");
const Getter = require("../../../Getter");
const Entity = require("../models/Entity");

class EntityWalletRequestGetter extends Getter {
    constructor(db, collections = new Collections()) {
        super(db, collections)
    }

    async getEntity(request) {
        if(request._metadata[this.collections.entityIdentifierKey()]) {
            return await (new Entity(this.db, this.collections))
                .setId(request._metadata[this.collections.entityIdentifierKey()])
                .get()
        }
    }

    async getWallet(request) {
        if(request._metadata[this.collections.entityIdentifierKey()] && request._metadata.wallet_id) {
            return await (new Entity(this.db, this.collections))
                .setId(request._metadata[this.collections.entityIdentifierKey()])
                .Wallets(request._metadata.wallet_id)
                .get()
        }
        return null;
    }

    getters() {
        return {
            wallet: arg => this.getWallet(arg),
            entity: arg => this.getEntity(arg),
        }
    }
}


module.exports = EntityWalletRequestGetter;