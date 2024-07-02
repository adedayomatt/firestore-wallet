const Collections = require("../../../Collections");
const Getter = require("../../../Getter");
const Entity = require("../models/Entity");

class EntityGetter extends Getter {
    constructor(db, collections = new Collections()) {
        super(db, collections)
    }

    async getWallets(entity) {
        return await (new Entity(this.db, this.collections)).setId(entity.id)
            .Wallets()
            .all()
    }

    async getTransactions(entity) {
        return await (new Entity(this.db, this.collections)).setId(entity.id)
            .Transactions()
            .all()
    }
    getters() {
        return {
            wallets: async arg => await this.getWallets(arg),
            transactions: async arg => await this.getTransactions(arg),
        }
    }
}


module.exports = EntityGetter;