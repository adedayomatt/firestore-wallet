const Integrations = require("../system/Integrations");

class RevolutQueries extends Integrations {
    constructor(db, collections) {
        super(db, collections)
    }

}

module.exports = RevolutQueries