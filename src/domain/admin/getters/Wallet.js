const status = require("../../../enums/status");
const walletTypes = require("../../../enums/wallet_types");
const AdminWallet = require("../../../services/AdminWallet");
const Getter = require("../../../Getter");
const Integrations = require("../../system/Integrations") ;

class AdminWalletGetter extends Getter {
    constructor(db, collections) {
        super(db, collections);
        this.integrations = new Integrations(db, collections)
    }

    getters() {
        return {
            type: wallet => walletTypes[wallet.type] || {},
            balance: async wallet => {
                try {
                    const balance = await new AdminWallet(wallet)
                        .setIntegrations(this.integrations)
                        .getBalance();
                    return balance ? JSON.stringify(balance) : null;
                } catch (e) { return null }
            },
            processor: wallet => new AdminWallet(wallet).getProvider(),
            status: wallet => wallet.status || status.enabled,
        }
    }
}
module.exports = AdminWalletGetter;