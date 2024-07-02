const Entity = require("../entity/models/Entity")
const Integrations = require("../system/Integrations")
const EntityIntegrations = require("../entity/Integrations")
const {TRANSFER_RECIPIENT_TYPE_NUMBAN, TRANSFER_SOURCE_BALANCE} = require("./constants");

class PaystackMutations {
    constructor(db, collections) {
        this.db = db;
        this.collections = collections
    }
    async validateNuban({ entity_id, nuban, bank_code }) {
        const integration = entity_id
            ? new EntityIntegrations(this.db).setEntity(new Entity(this.db, this.collections).setId(entity_id))
            : new Integrations(this.db, this.collections)
        return (await integration.paystack())
            .validateNuban(nuban, bank_code)
    }
    async createTransferRecipient({ entity_id, name, account_number, bank_code }) {
        const integration = entity_id
            ? new EntityIntegrations(this.db).setEntity(new Entity(this.db, this.collections).setId(entity_id))
            : new Integrations(this.db, this.collections)
        return (await integration.paystack())
            .createTransferRecipient(TRANSFER_RECIPIENT_TYPE_NUMBAN, name, account_number, bank_code)
    }
    async createTransfer({ entity_id, amount, recipient }) {
        const integration = entity_id
            ? new EntityIntegrations(this.db).setEntity(new Entity(this.db, this.collections).setId(entity_id))
            : new Integrations(this.db, this.collections)
        return (await integration.paystack())
            .createTransfer(recipient, TRANSFER_SOURCE_BALANCE, amount);    }
}

module.exports = PaystackMutations