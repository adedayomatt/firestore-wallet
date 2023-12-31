const Collections = require("../../../Collections");
const Getter = require("../../../Getter");

class EntityGetter extends Getter{
    constructor(db, collections = new Collections()) {
        super(db, collections)
    }

    async getWallets(entity) {
        return await this.entity.setId(entity.id)
            .Wallets()
            .all()
    }

    async getTransactions(entity) {
        return await this.entity.setId(entity.id)
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