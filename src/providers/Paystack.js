const PaystackApi = require("paystack-api");
class Paystack {
    constructor({ secret_key }) {
        this.credentials = { secret_key };
        this.paystack = PaystackApi(secret_key);
    }
    sendResponse(response, action = "") {
        if(response.status && response.data) {
            return response.data;
        }
        throw new Error(`${action ? 'Could not '+action+'. ' : ''}${response.message}`);
    }

    handleException(e) {
        if(/d*\s-\s\{.*}/.test(e.message)) {
            e = JSON.parse(e.message.slice(e.message.indexOf("{")));
        }
        throw new Error(e.message);
    }
    async getBanks() {
        return this.sendResponse(await this.paystack.misc.list_banks(), "get banks")
    }
    async getBalance() {
        return this.sendResponse(await this.paystack.transfer_control.balance(), "get balance")
    }
    async validateNuban(account_number, bank_code) {
        try {
            return this.sendResponse(await this.paystack.verification.resolveAccount({
                account_number, bank_code
            }), "validate account")
        } catch (e) {
            return this.handleException(e);
        }
    }
    async createTransferRecipient(type, name, account_number, bank_code) {
        try {
            return this.sendResponse(await this.paystack.transfer_recipient.create({
                type, name, account_number, bank_code
            }), "create transfer recipient")
        } catch (e) {
            return this.handleException(e)
        }

    }
    async removeTransferRecipient(recipient_code) {
        try {
            return this.sendResponse(await this.paystack.transfer_recipient.remove({ recipient_code }), "remove transfer recipient")
        } catch (e) {
            return this.handleException(e)
        }
    }
    async createTransfer(recipient, source, amount, reference, reason) {
        try {
            return this.sendResponse(await this.paystack.transfer.create({
                source, amount, recipient, reference, reason
            }), "create transfer")
        } catch (e) {
            return this.handleException(e)
        }
    }
    async finalizeTransfer(transfer_code, otp) {
        try {
            return this.sendResponse(await this.paystack.transfer.finalize({
                transfer_code, otp
            }), "finalize transfer")
        } catch (e) {
            return this.handleException(e)
        }

    }
    async verifyTransfer(reference) {
        try {
            return this.sendResponse(await this.paystack.transfer.verify({ reference }), "verify transfer")
        } catch (e) {
           return this.handleException(e)
        }
    }
}

module.exports = Paystack;