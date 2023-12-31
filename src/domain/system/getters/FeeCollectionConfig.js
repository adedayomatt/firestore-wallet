const Getter = require("../../../Getter");

class FeeCollectionConfigGetter  extends Getter {
    constructor(db, collections) {
        super(db, collections)
    }

    getters() {
        return {
            usd: config => config.usd,
            ngn: config => config.ngn,
            gbp: config => config.gbp,
        }
    }
}

module.exports = FeeCollectionConfigGetter;