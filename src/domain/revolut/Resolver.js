const Collections = require("../../Collections");
const Resolver = require("../../Resolver");
const Mutations = require("./Mutations");
class RevolutResolver extends Resolver {
        constructor(db, collections = new Collections()) {
                super(db, collections)
        }

        mutations() {
                const mutations = new Mutations(this.db, this.collections)  ;
                return {
                        revolutValidateAccountName: async (parent, args, context) => await mutations.validateAccountName(args),
                }
        }
}

module.exports = RevolutResolver;
