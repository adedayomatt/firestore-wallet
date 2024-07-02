const Integrations = require("../domain/system/Integrations");

class WalletProvider {
    constructor(wallet) {
        this.wallet = wallet;
    }

    setIntegrations(integrations) {
        this.integrations = integrations;
        return this;
    }

    getIntegrations() {
        return this.integrations
    }

    setModel(model) {
        this.model = model;
        return this;
    }
    getProvider() {
        return {
            "ngn": "paystack",
            "usd": "stripe",
            "gbp": "revolut"
        }[this.wallet.type]
    }

}

module.exports = WalletProvider;