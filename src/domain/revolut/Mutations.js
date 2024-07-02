const Integrations = require("../system/Integrations");
const EntityIntegrations = require("../entity/Integrations");
const Entity = require("../entity/models/Entity");

class RevolutMutations {
    constructor(db, collections) {
        this.db = db;
        this.collections = collections
    }

    async validateAccountName({ entity_id, account_details }) {
        const integration = entity_id
            ? new EntityIntegrations(this.db).setEntity(new Entity(this.db, this.collections).setId(entity_id))
            : new Integrations(this.db, this.collections)
        return await (await integration.revolut())
            .validateAccountName(account_details)
    }
}

module.exports = RevolutMutations;