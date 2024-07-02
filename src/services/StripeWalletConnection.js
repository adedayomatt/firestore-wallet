const WalletProvider = require("./WalletProvider");
const { GRANT_TYPE_AUTHORIZATION_CODE } = require("../domain/stripe/constants")
const status = require("../enums/status");

class StripeWalletConnection extends WalletProvider  {
    constructor(wallet) {
        super(wallet);
        this.connection = wallet.connection ? JSON.parse(wallet.connection) : null;
    }

    async connect(authorization_code) {
        const StripeI = await this.integrations.stripe()
        try {
            const connection = await StripeI.connectAccount(GRANT_TYPE_AUTHORIZATION_CODE, authorization_code);
            if(connection.stripe_user_id){
                connection.account = await StripeI.getAccount(connection.stripe_user_id)
            }
            return connection;
        } catch (e) {
            throw new Error(e.message)
        }
    }

    async disconnect() {
        const StripeI = await this.integrations.stripe()
        try {
            await StripeI.disconnectAccount(this.connection.stripe_user_id);
        } catch (e) {
            throw new Error(e.message)
        }
    }

    setTransaction(transaction) {
        this.transaction = transaction;
        return this;
    }

    async initiateTransfer(amount, description, metadata) {
        if(!this.connection) throw new Error("Wallet is not connected to a Stripe account");
        const StripeI = await this.integrations.stripe()
        const transfer = await StripeI.createTransfer(
            this.connection.stripe_user_id, this.wallet.type, amount, description, metadata
        )
        if(this.transaction) {
            await this.transaction.setMetadata([
                { key: "external_reference", value: transfer.id },
                { key: "external_response", value: JSON.stringify(transfer) }
            ]).set({ provider_status: transfer.id ? status.success : status.failed })
        }
        return transfer;
    }
}

module.exports = StripeWalletConnection;