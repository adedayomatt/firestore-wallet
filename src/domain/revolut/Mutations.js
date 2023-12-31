const Integrations = require("../system/Integrations");

class RevolutMutations extends Integrations {
    constructor(db, collections) {
        super(db, collections)
    }

    async validateAccountName({ account_details }) {
        return await (await this.revolut())
            .validateAccountName(account_details)
    }
}

module.exports = RevolutMutations;