class Collections {
    constructor(config = {}) {
        this.config = config
    }

    entityCollection() {
        return this.config.entity_collection || "users";
    }

    entity() {
        return this.config.entity || this.config.entity_collection;
    }

    getCollection(entities = []) {
        return [this.entity()].concat(entities).join("_")
    }
    entityIdentifierKey() {
        return this.getCollection(["id"])
    }
    entityTransactions() {
        return this.getCollection(["transactions"])
    }
    entityWallets() {
        return this.getCollection(["wallets"])
    }
    entityWithdrawalRequests() {
        return this.getCollection(["withdrawal_requests"])
    }
    entityWalletHistory() {
        return this.getCollection(["wallet_history"])
    }
    adminWallets() {
        return this.getCollection(["admin", "wallets"])
    }

    adminWalletHistory() {
        return this.getCollection(["admin", "wallet", "history"])
    }
    adminCollectionWallets() {
        return this.getCollection(["admin", "collection", "wallets"])
    }

    adminCollectionWalletHistory() {
        return this.getCollection(["admin", "collection", "wallets", "history"])
    }

    system() {
        return this.getCollection(["system"])
    }
    systemIntegrations() {
        return this.getCollection(["integrations"])
    }

    systemFeeWalletConfig() {
        return this.getCollection(["system", "fee", "collection"])
    }
}

module.exports = Collections;