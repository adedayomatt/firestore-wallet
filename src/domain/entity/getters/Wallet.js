const status = require("../../../enums/status");
const walletTypes = require("../../../enums/wallet_types");
const  Collections = require("../../../Collections");
const Getter = require("../../../Getter");

class EntityWalletGetter extends Getter {
    constructor(db, collections = new Collections()) {
        super(db, collections)
    }

    getters() {
        return {
            type: wallet => walletTypes[wallet.type] || {},
            status: wallet => wallet.status || status.enabled,
            available: wallet => wallet.amount - (wallet.blocked + wallet.suspended)
        }
    }
}


module.exports = EntityWalletGetter;