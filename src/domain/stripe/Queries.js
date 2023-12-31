const Integrations = require("../system/Integrations");

class StripeQueries extends Integrations {
    constructor(db, collections) {
        super(db, collections)
    }

}

module.exports = StripeQueries