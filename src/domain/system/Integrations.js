const System = require("./models/System");
const Paystack = require("../../providers/Paystack");
const Stripe = require("../../providers/Stripe");
const Revolut = require("../../providers/Revolut");
const Collections = require("../../Collections")

class Integrations {
    constructor(db, collections = new Collections) {
        this.system = new System(db, collections)
    }

    async paystack() {
        const i = await this.system.Integration("paystack").get()
        if (i && i.enabled) return new Paystack(i);
        throw new Error("Service not available")
    }

    async stripe() {
        const i = await this.system.Integration("stripe").get()
        if (i && i.enabled) return new Stripe(i);
        throw new Error("Service not available")
    }

    async revolut() {
        const revolut = this.system.Integration("revolut");
        const i = await revolut.get();
        if(i && i.enabled && i.auth) {
            return new Revolut(i).setIntegrationModel(revolut);
        }
        throw new Error("Service not available")
    }
}

module.exports = Integrations;