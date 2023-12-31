const Integrations = require("../domain/system/Integrations") ;
const WalletProvider = require("./WalletProvider");

class AdminWallet extends WalletProvider {
    constructor(wallet) {
        super(wallet);
    }

    async getBalance() {
        switch (this.getProvider()) {
            case "stripe":
                return (await this.integrations.stripe()).getBalance();
            case "revolut":
                return (await this.integrations.revolut()).getBalance()
            case "paystack":
                return (await this.integrations.paystack()).getBalance()
        }
        return null;
    }
}

module.exports = AdminWallet;