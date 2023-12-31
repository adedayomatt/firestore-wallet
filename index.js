const common = require("./src/domain/common");
const admin = require("./src/domain/admin");
const system = require("./src/domain/system");
const entity = require("./src/domain/entity");
const paystack = require("./src/domain/paystack");
const stripe = require("./src/domain/stripe");
const revolut = require("./src/domain/revolut");
const Entity = require("./src/domain/entity/models/Entity");
const EntityTransaction = require("./src/domain/entity/models/Transaction");
const EntityWallet = require("./src/domain/entity/models/Wallet");
const EntityWithdrawalRequest = require("./src/domain/entity/models/WithdrawalRequest");
const AdminWallet = require("./src/domain/admin/models/Wallet");
const AdminCollectionWallet = require("./src/domain/admin/models/CollectionWallet");
const System = require("./src/domain/system/models/System");
const Collections = require("./src/Collections")

class Wallet {
    constructor(db) {
        this.db = db;
        this.setCollections()
    }

    setCollections(collections = new Collections) {
        this.collections = collections
        return this;
    }

    static schemas() {
        return {
            common: common.schema,
            entity: entity.schema,
            admin: admin.schema,
            paystack: paystack.schema,
            revolut: revolut.schema,
            system: system.schema
        }
    }

    getModels() {
        return {
            Entity: new Entity(this.db, this.collections),
            EntityWallet: new EntityWallet(this.db, this.collections),
            EntityTransaction: new EntityTransaction(this.db, this.collections),
            EntityWithdrawalRequest: new EntityWithdrawalRequest(this.db, this.collections),
            AdminWallet: new AdminWallet(this.db, this.collections),
            AdminCollectionWallet: new AdminCollectionWallet(this.db, this.collections),
            System: new System(this.db, this.collections)
        }
    }

    getQueries() {
        return {
            entity: new entity.queries(this.db, this.collections),
            admin: new admin.queries(this.db, this.collections),
            paystack: new paystack.queries(this.db, this.collections),
            stripe: new stripe.queries(this.db, this.collections),
            revolut: new revolut.queries(this.db, this.collections),
            system: new system.queries(this.db, this.collections)
        }
    }

    getMutations() {
        return {
            entity: new entity.mutations(this.db, this.collections),
            admin: new admin.mutations(this.db, this.collections),
            paystack: new paystack.mutations(this.db, this.collections),
            stripe: new stripe.mutations(this.db, this.collections),
            revolut: new revolut.mutations(this.db, this.collections),
            system: new system.mutations(this.db, this.collections)
        }
    }

    getResolvers() {
        return {
            entity: new entity.resolvers(this.db, this.collections),
            admin: new admin.resolvers(this.db, this.collections),
            paystack: new paystack.resolvers(this.db, this.collections),
            revolut: new revolut.resolvers(this.db, this.collections),
            system: new system.resolvers(this.db, this.collections)
        }
    }

}

module.exports = {
    Entity,
    EntityWallet,
    EntityTransaction,
    EntityWithdrawalRequest,
    AdminWallet,
    AdminCollectionWallet,
    System,
    Wallet,
    Collections
}