const Collections = require("../../Collections");
const Resolver = require("../../Resolver");
const Queries = require("./Queries");
const Mutations = require("./Mutations");
class PaystackResolver extends Resolver {
        constructor(db, collections = new Collections()) {
                super(db, collections)
        }

        queries() {
            const queries = new Queries(this.db, this.collections)  ;
            return {
                    paystackGetBanks: async (parent, args, context) => await queries.getBanks(args),
            }
        }

        mutations() {
                const mutations = new Mutations(this.db, this.collections)  ;
                return {
                        paystackValidateNuban: async (parent, args, context) => await mutations.validateNuban(args),
                        paystackCreateTransfer: async (parent, args, context) => await mutations.createTransfer(args),
                        paystackCreateTransferRecipient: async (parent, args, context) => await mutations.createTransferRecipient(args),
                }
        }
}

module.exports = PaystackResolver;
