const Integrations = require("../system/Integrations");

class PaystackQueries extends Integrations {
    constructor(db, collections) {
        super(db, collections)
    }

    async getBanks() {
        return (await this.paystack())
            .getBanks()
    }
}

module.exports = PaystackQueries