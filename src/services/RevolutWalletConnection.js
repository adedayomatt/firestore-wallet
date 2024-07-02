const WalletProvider = require("./WalletProvider");

class RevolutWalletConnection extends WalletProvider  {
    constructor(wallet) {
        super(wallet);
        this.connection = wallet.connection ? JSON.parse(wallet.connection) : null;
    }
    async connect(account_details) {
        const RevolutI = await this.integrations.revolut();
        try {
            return await RevolutI.createCounterParty(account_details);
        } catch (e) {
            throw new Error(e.message)
        }
    }
    async disconnect() {
        const RevolutI = await this.integrations.revolut();
        try {
            return await RevolutI.deleteCounterParty(this.connection.id);
        } catch (e) {
            throw new Error(e.message)
        }
    }
    setTransaction(transaction) {
        this.transaction = transaction;
        return this;
    }
    getRequestId() {
        return `req-${this.transaction.id}`.toLowerCase();
    }
    getTargetAccount() {
        const accounts = this.connection.accounts || [];
        return accounts.length ? accounts[0] : null
    }
    async initiateTransfer(amount, currency, reference) {
        if(!this.connection) throw new Error("Wallet is not connected to a bank account");
        const targetAccount = this.getTargetAccount();
        if(!targetAccount) throw new Error("No valid account found for wallet");
        const RevolutI = await this.integrations.revolut();
        const transfer = await RevolutI.createPayment(
            {
                request_id: this.getRequestId(),
                account_id: RevolutI.getPaymentSourceAccount(),
                receiver: {
                    counterparty_id: this.connection.id,
                    account_id: targetAccount.id
                },
                charge_bearer: RevolutI.getPaymentChargeBearer(),
                amount, currency, reference
            }
        )
        if(this.transaction) {
            await this.transaction.setMetadata([
                { key: "external_reference", value: transfer.id },
                { key: "external_response", value: JSON.stringify(transfer) }
            ]).set({ provider_status: transfer.state })
        }
        return transfer;
    }
}

module.exports = RevolutWalletConnection;