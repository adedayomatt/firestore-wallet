const System = require("./models/System");
const RevolutConnect = require("../../providers/RevolutConnect");

class SystemMutations extends System {
    constructor(db, collections) {
        super(db, collections)
    }

    async setPaystackIntegration({ data }) {
        return await this.Integration("paystack").createOrUpdate(data)
    }

    async setStripeIntegration({ data }) {
        return await this.Integration("stripe").createOrUpdate(data)
    }

    async setRevolutIntegration({ data }) {
        return await this.Integration("revolut").createOrUpdate(data)
    }

    async authorizeRevolut({ authorization_code }) {
        const model = this.Integration("revolut");
        const integration = await model.get()
        if(!integration) throw new Error("Revolut is not configured");
        const authorization = await (new RevolutConnect(integration))
            .getAccessToken(authorization_code)
        return await model.update({ auth: JSON.stringify(authorization) })
    }

    async revokeRevolut() {
        const model = this.Integration("revolut");
        const integration = await model.get()
        if(!integration) throw new Error("Revolut is not configured");
        return await model.update({ auth: null, config: null })
    }

    async setAdminFeeCollectionConfig({ data }) {
        const config = this.FeeCollectionConfig();
        return await config.createOrUpdate(data);
    }
}

module.exports = SystemMutations