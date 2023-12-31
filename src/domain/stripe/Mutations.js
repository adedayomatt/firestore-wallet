const Integrations = require("../system/Integrations")

class StripeMutations extends Integrations {
    constructor(db, collections) {
        super(db, collections)
    }
}

module.exports = StripeMutations