const RevolutConnect = require("./RevolutConnect");
class Revolut extends RevolutConnect {
    constructor(config) {
        super(config);
    }
    getPaymentSourceAccount() {
        return this.getConfig().payment_source_account_id;
    }
    getPaymentChargeBearer() {
        return this.getConfig().payment_charge_bearer;
    }
    async getBalance() {
        return this.sendResponse(
            await this.rawGet("accounts")
        );
    }
    async validateAccountName(account_details) {
        return this.sendResponse(
            await this.rawPost("account-name-validation", JSON.stringify(account_details))
        )
    }
    async createCounterParty(account_details) {
        return this.sendResponse(
            await this.rawPost("counterparty", JSON.stringify(account_details))
        )
    }
    async deleteCounterParty(id) {
        const response = await this.rawDelete(`counterparty/${id}`);
        if(response.status === 204 || response.statusCode === 204) return true;
        throw new Error("Could not remove counterparty. "+response.statusText);
    }
    async createTransfer({ request_id, source_account_id, target_account_id, amount, currency, reference }) {
        return this.sendResponse(
            await this.rawPost("transfer", JSON.stringify(
                { amount, currency, reference, target_account_id, source_account_id, request_id }
            ))
        )
    }
    async createPayment({ request_id, account_id, receiver, charge_bearer, amount, currency, reference }) {
        return this.sendResponse(
            await this.rawPost("pay", JSON.stringify(
                { request_id, account_id, receiver, charge_bearer, amount, currency, reference }
            ))
        )
    }
}

module.exports = Revolut;