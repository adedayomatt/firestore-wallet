const status = require("../../../enums/status");
const walletTypes = require("../../../enums/wallet_types");
const  Collections = require("../../../Collections");
const Getter = require("../../../Getter");
const Entity = require("../models/Entity");

class EntityWalletGetter extends Getter {
    constructor(db, collections = new Collections()) {
        super(db, collections)
    }

    async getParentEntity(wallet) {
        if(wallet.parent_entity_id) {
            return await (new Entity(this.db, this.collections))
                .setId(wallet.parent_entity_id)
                .get()
        }
        return null;
    }

    getters() {
        return {
            type: wallet => walletTypes[wallet.type] || {},
            status: wallet => wallet.status || status.enabled,
            parent_entity: wallet => this.getParentEntity(wallet),
            available: wallet => wallet.amount - (wallet.blocked + wallet.suspended)
        }
    }
}


module.exports = EntityWalletGetter;