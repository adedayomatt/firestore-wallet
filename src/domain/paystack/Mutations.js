const Integrations = require("../system/Integrations")

class PaystackMutations extends Integrations {
    constructor(db, collections) {
        super(db, collections)
    }

    async validateNuban({ nuban, bank_code }) {
        return (await this.paystack())
            .validateNuban(nuban, bank_code)
    }
    async createTransferRecipient({ name, account_number, bank_code }) {
        return (await this.paystack())
            .createTransferRecipient(constants.TRANSFER_RECIPIENT_TYPE_NUMBAN, name, account_number, bank_code)
    }
    async createTransfer({ amount, recipient }) {
        return (await this.paystack())
            .createTransfer(recipient, constants.TRANSFER_SOURCE_BALANCE, amount);    }
}

module.exports = PaystackMutations