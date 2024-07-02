const Entity = require("./models/Entity");
const Paystack = require("../../providers/Paystack");
const Stripe = require("../../providers/Stripe");
const Revolut = require("../../providers/Revolut");
const Collections = require("../../Collections")
const { FirestoreCollectionModel} = require("@adedayomatthews/firestore-model");

class EntityIntegrations {
    constructor(db, collections = new Collections) {
        this.db = db;
    }
    setEntity(entity = new Entity) {
        this.entity = entity;
        return this;
    }
    getIntegrationModel(integrationRef) {
        return new FirestoreCollectionModel(this.db)
            .setId(integrationRef)
    }
    async getIntegrationSetup(integrationRef) {
        const setup = await this.getIntegrationModel(integrationRef).get();
        if(setup && setup.enabled) return setup;
        throw new Error('Service not enabled')
    }

    async paystack() {
        const entity = await this.entity.get()
        if (entity && entity.integrations && entity.integrations.paystack) {
           return new Paystack(await this.getIntegrationSetup(entity.integrations.paystack));
        }
        throw new Error("Service not integrated")
    }

    async stripe() {
        const entity = await this.entity.get()
        if (entity && entity.integrations && entity.integrations.stripe) {
            return new Stripe(await this.getIntegrationSetup(entity.integrations.stripe));
        }
        throw new Error("Service not integrated")
    }

    async revolut() {
        const entity = await this.entity.get()
        if (entity && entity.integrations && entity.integrations.revolut) {
            return new Revolut(await this.getIntegrationSetup(entity.integrations.revolut))
                .setIntegrationModel(this.getIntegrationModel(entity.integrations.revolut));
        }
        throw new Error("Service not integrated")
    }
}

module.exports = EntityIntegrations;