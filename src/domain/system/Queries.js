const System = require("./models/System");
class SystemQueries extends System {
    constructor(db, collections) {
        super(db, collections);
    }
    async getPaystackIntegration() {
        return await this.Integration("paystack").get()
    }

    async getStripeIntegration() {
        return await this.Integration("stripe").get()
    }

    async getRevolutIntegration() {
        return await this.Integration("revolut").get()
    }

    async getAdminFeeCollectionConfig() {
        return await this.FeeCollectionConfig().get();
    }

}

module.exports = SystemQueries