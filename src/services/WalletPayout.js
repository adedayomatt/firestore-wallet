const WalletProvider = require("./WalletProvider")
const PaystackWalletConnection = require("./PaystackWalletConnection");
const StripeWalletConnection = require("./StripeWalletConnection");
const RevolutWalletConnection = require("./RevolutWalletConnection");
class WalletPayout extends WalletProvider {
    constructor(wallet) {
        super(wallet)
    }

    setAmount(amount) {
        this.amount = amount;
        return this;
    }
    setReference(reference) {
        this.reference = reference;
        return this;
    }
    setDescription(description) {
        this.description = description;
        return this;
    }
    setMetadata(metadata) {
        this.metadata = metadata;
        return this;
    }

    setTransaction(transaction) {
        this.transaction = transaction;
        return this;
    }

    async payout() {
        let transfer = null

        await this.transaction.setMetadata([
            { key: "processor", value: this.getProvider() },
            { key: "internal_reference", value: this.reference }
        ]).set();

         switch (this.getProvider()) {
             case "paystack":
                transfer = await new PaystackWalletConnection(this.wallet)
                    .setIntegrations(this.integrations)
                    .setTransaction(this.transaction)
                    .initiateTransfer(this.amount * 100, this.reference, this.description);
                 break;
             case "stripe":
                 transfer = await new StripeWalletConnection(this.wallet)
                     .setIntegrations(this.integrations)
                     .setTransaction(this.transaction)
                     .initiateTransfer(this.amount * 100, this.description, this.metadata);
                 break;
             case "revolut":
                 transfer = await new RevolutWalletConnection(this.wallet)
                     .setIntegrations(this.integrations)
                     .setTransaction(this.transaction)
                     .initiateTransfer(this.amount, this.wallet.type.toUpperCase(), this.reference);
                 break;
         }
        return transfer;
    }
}

module.exports = WalletPayout;