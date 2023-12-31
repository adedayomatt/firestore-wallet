const walletTypes = require("../../../enums/wallet_types");
const status = require("../../../enums/status");
const WalletLedger = require("../../../Services/WalletLedger");
const Getter = require("../../../Getter");

class AdminCollectionWalletGetter extends Getter {
    constructor(db, collections) {
        super(db, collections)
    }

    getters() {
        return {
            type: wallet => walletTypes[wallet.type] || {},
            status: wallet => wallet.status || status.enabled,
            available: wallet => new WalletLedger().setWalletData(wallet).getBalance()
        }
    }
}

module.exports = AdminCollectionWalletGetter;