const RevolutConnect = require("../../../providers/RevolutConnect")
const Getter = require("../../../Getter");
class RevolutIntegrationGetter  extends Getter {
    constructor(db, collections) {
        super(db, collections)
    }

    getters() {
        return {
            connect_url: config => new RevolutConnect(config).getConnectUrl(),
            authorized: config => {
                const auth = config.auth ? JSON.parse(config.auth) : {};
                return Boolean(auth && auth.access_token)
            }
        }
    }
}
module.exports = RevolutIntegrationGetter;