const Entity = require("../entity/models/Entity")
const Integrations = require("../system/Integrations")
const EntityIntegrations = require("../entity/Integrations")
class PaystackQueries {
    constructor(db, collections) {
        this.db = db;
        this.collections = collections
    }

    async getBanks(entity_id) {
        const integration = entity_id
            ? new EntityIntegrations(this.db).setEntity(new Entity(this.db, this.collections).setId(entity_id))
            : new Integrations(this.db, this.collections)
        return (await integration.paystack())
            .getBanks()
    }
}

module.exports = PaystackQueries