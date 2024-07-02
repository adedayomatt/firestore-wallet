const WalletProvider = require("./WalletProvider");
const { TRANSFER_RECIPIENT_TYPE_NUMBAN, TRANSFER_SOURCE_BALANCE} = require("../domain/paystack/constants");

class PaystackWalletConnection extends WalletProvider {
    constructor(wallet) {
        super(wallet);
        this.connection = wallet.connection ? JSON.parse(wallet.connection) : null;
    }

    async connect(name, account_number, bank_code) {
        const PaystackI = await this.integrations.paystack()
        try {
            return await PaystackI.createTransferRecipient(
                TRANSFER_RECIPIENT_TYPE_NUMBAN, name, account_number, bank_code
            );
        } catch (e) {
            throw new Error(e.message)
        }
    }

    async disconnect() {
        const PaystackI = await this.integrations.paystack()
        try {
            await PaystackI.removeTransferRecipient(this.connection.recipient_code)
            // eslint-disable-next-line no-empty
        } catch (e) {}
    }
    setTransaction(transaction) {
        this.transaction = transaction;
        return this;
    }

    async initiateTransfer( amount, reference, description ) {
        if(!this.connection) throw new Error("Wallet is not connected to a bank account");
        const PaystackI = await this.integrations.paystack()
        const transfer = await PaystackI.createTransfer(
            this.connection.recipient_code, TRANSFER_SOURCE_BALANCE, amount, reference, description
        )
        if(this.transaction) {
            await this.transaction.setMetadata([
                { key: "external_reference", value: transfer.transfer_code },
                { key: "external_response", value: JSON.stringify(transfer) }
            ]).set({ provider_status: transfer.status })
        }
        return transfer;
    }
    async finalizeTransfer(transfer_code, otp) {
        const PaystackI = await this.integrations.paystack()
        return PaystackI.finalizeTransfer(transfer_code, otp);
    }
}

module.exports = PaystackWalletConnection;