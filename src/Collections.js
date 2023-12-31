class Collections {
    constructor(config = {}) {
        this.config = config
    }
    concatenate(entities = []) {
        return entities.join("_")
    }

    entityCollection() {
        return this.config.entity_collection || "users";
    }

    entity() {
        return this.config.entity || this.config.entity_collection;
    }
    entityIdentifierKey() {
        return this.concatenate([this.entity(),"id"])
    }
    entityTransactions() {
        return this.concatenate([this.entity(), "transactions"])
    }
    entityWallets() {
        return this.concatenate([this.entity(), "wallets"])
    }
    entityWithdrawalRequests() {
        return this.concatenate([this.entity(), "withdrawal_requests"])
    }
    entityWalletHistory() {
        return this.concatenate([this.entity(), "wallet_history"])
    }
    adminWallets() {
        return this.concatenate(["admin", "wallets"])
    }

    adminWalletHistory() {
        return this.concatenate(["admin", "wallet", "history"])
    }
    adminCollectionWallets() {
        return this.concatenate(["admin", "collection", "wallets"])
    }

    adminCollectionWalletHistory() {
        return this.concatenate(["admin", "collection", "wallets", "history"])
    }

    system() {
        return this.concatenate(["system"])
    }
    systemIntegrations() {
        return this.concatenate(["system", "integration"])
    }

    systemAdmins() {
        return this.concatenate(["system", "admins"])
    }

    systemFeeWalletConfig() {
        return this.concatenate(["system", "fee", "collection"])
    }
}

module.exports = Collections;