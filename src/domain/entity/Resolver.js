const EntityGetter = require("./getters/Entity")
const EntityWalletGetter = require("./getters/Wallet")
const EntityTransactionGetter = require("./getters/Transaction")
const EntityWithdrawalRequestGetter = require("./getters/WithdrawalRequest")
const Collections = require("../../Collections");
const Resolver = require("../../Resolver");
const Queries = require("./Queries");
const Mutations = require("./Mutations");
class EntityResolver extends Resolver {
        constructor(db, collections = new Collections()) {
                super(db, collections)
        }

        queries() {
            const queries = new Queries(this.db, this.collections)  ;
            return {
                    getEntity: async (parent, args, context) => await queries.getEntity(args),
                    getEntityTransactions: async (parent, args, context) => await queries.getTransactions(args),
                    getEntityWithdrawalRequests: async (parent, args, context) => await queries.getWithdrawalRequests(args)
            }
        }

        mutations() {
                const mutations = new Mutations(this.db, this.collections)  ;
                return {
                        createEntity: async (parent, args, context) => await mutations.createEntity(args),
                        createEntityWallet: async (parent, args, context) => await mutations.createWallet(args),
                        createEntityWithdrawalRequest: async (parent, args, context) => await mutations.createWithdrawalRequest(args),
                        connectEntityNgnWallet: async (parent, args, context) => await mutations.connectNgnWallet(args),
                        disconnectEntityNgnWallet: async (parent, args, context) => await mutations.disconnectNgnWallet(args),
                        connectEntityUsdWallet: async (parent, args, context) => await mutations.connectUsdWallet(args),
                        disconnectEntityUsdWallet: async (parent, args, context) => await mutations.disconnectUsdWallet(args),
                        connectEntityGbpWallet: async (parent, args, context) => await mutations.connectGbpWallet(args),
                        disconnectEntityGbpWallet: async (parent, args, context) => await mutations.disconnectGbpWallet(args),
                        entityWalletTransfer: async (parent, args, context) => await mutations.walletTransfer(args),
                        setEntityIntegrations: async (parent, args, context) => await mutations.setEntityIntegrations(args),
                }
        }

        types() {
                return {
                        Entity: new EntityGetter(this.db, this.collections).getters(),
                        EntityWallet: new EntityWalletGetter(this.db, this.collections).getters(),
                        EntityTransaction: new EntityTransactionGetter(this.db, this.collections).getters(),
                        EntityWithdrawalRequest: new EntityWithdrawalRequestGetter(this.db, this.collections).getters()
                }
        }
}

module.exports = EntityResolver;
