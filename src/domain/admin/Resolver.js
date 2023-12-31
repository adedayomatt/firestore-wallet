const AdminWallet = require("./getters/Wallet")
const AdminCollectionWallet = require("./getters/CollectionWallet")
const Resolver = require("../../Resolver");
const Queries = require("./Queries");
const Mutations = require("./Mutations");
class AdminResolver extends Resolver {
     constructor(db, collections) {
         super(db, collections)
     }

     queries() {
         const queries = new Queries(this.db, this.collections)
         return {
             getAdminWallets: async (parent, args, context) => await queries.getAdminWallets(args),
             getAdminCollectionWallets: async (parent, args, context) => await queries.getAdminCollectionWallets(args),
             getAllEntityTransactions: async (parent, args, context) => await queries.getAllTransactions(args),
             getAllEntityWithdrawalRequests: async (parent, args, context) => await queries.getAllWithdrawalRequests(args),
         }
     }

     mutations() {
         const mutations = new Mutations(this.db, this.collections)
         return {
             createAdminWallet: async (parent, args, context) => await mutations.createAdminWallet(args),
             createAdminCollectionWallet: async (parent, args, context) => await mutations.createAdminCollectionWallet(args),
             createEntityTransaction: async (parent, args, context) => await mutations.createTransaction(args),
             updateEntityTransaction: async (parent, args, context) => await mutations.updateTransaction(args),
             fundEntityWallet: async (parent, args, context) => await mutations.fundWallet(args),
             reviewEntityWithdrawalRequest: async (parent, args, context) => await mutations.reviewWithdrawalRequest(args)
         }
     }

    types() {
         return {
             AdminWallet: new AdminWallet(this.db, this.collections).getters(),
             AdminCollectionWallet: new AdminCollectionWallet(this.db, this.collections).getters()
         }
     }
}

module.exports = AdminResolver
