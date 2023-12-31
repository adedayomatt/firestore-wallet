const Resolver = require("../../Resolver");
const RevolutIntegrationGetter = require("./getters/RevolutIntegration")
const FeeCollectionConfigGetter = require("./getters/FeeCollectionConfig")
const Queries = require("./Queries");
const Mutations = require("./Mutations");

class SystemResolver extends Resolver {
        constructor(db, collections) {
                super(db, collections)
        }

        queries() {
                const queries = new Queries(this.db, this.collections)  ;
                return {
                        getPaystackIntegration: async (parent, args, context) => await queries.getPaystackIntegration(args),
                        getStripeIntegration: async (parent, args, context) => await queries.getStripeIntegration(args),
                        getRevolutIntegration: async (parent, args, context) => await queries.getRevolutIntegration(args),
                        getAdminFeeCollectionConfig: async (parent, args, context) => await queries.getAdminFeeCollectionConfig(args),
                }
        }

        mutations() {
                const mutations = new Mutations(this.db, this.collections)  ;
                return {
                        setPaystackIntegration: async (parent, args, context) => await mutations.setPaystackIntegration(args),
                        setStripeIntegration: async (parent, args, context) => await mutations.setStripeIntegration(args),
                        setRevolutIntegration: async (parent, args, context) => await mutations.setRevolutIntegration(args),
                        authorizeRevolut: async (parent, args, context) => await mutations.authorizeRevolut(args),
                        revokeRevolut: async (parent, args, context) => await mutations.revokeRevolut(args),
                        setAdminFeeCollectionConfig: async (parent, args, context) => await mutations.setAdminFeeCollectionConfig(args),
                }
        }

        types() {
                return {
                        RevolutIntegration: new RevolutIntegrationGetter(this.db, this.collections).getters(),
                        AdminFeeCollectionConfig: new FeeCollectionConfigGetter(this.db, this.collections).getters()
                }
        }
}

module.exports = SystemResolver