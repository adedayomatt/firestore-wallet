const StripeApi = require("stripe");
class Stripe {
    constructor({ connect_client_id, secret_key }) {
        this.credentials = { connect_client_id, secret_key };
        this.stripe = StripeApi(secret_key);
    }
    async connectAccount(grant_type, code) {
        return await this.stripe.oauth.token({ grant_type, code });
    }

    async disconnectAccount(id) {
        return await this.stripe.oauth.deauthorize({
            client_id: this.credentials.connect_client_id,
            stripe_user_id: id
        });
    }
    async getAccount(id) {
        return await this.stripe.account.retrieve(id);
    }

    async getBalance() {
        return await this.stripe.balance.retrieve();
    }

    async createTransfer(destination, currency, amount, description, metadata) {
        return await this.stripe.transfers.create({
            currency, amount, destination, description, metadata
        })
    }
}

module.exports = Stripe;