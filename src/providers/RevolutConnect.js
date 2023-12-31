const Http = require("./Http");
const qs = require("qs");
const moment = require("moment");
class RevolutConnect extends Http {
    constructor(config) {
        super();
        this.config = config
        this.setAxiosConfig({
            baseURL: this.getApiBaseUrl(),
            headers: this.getHeaders()
        })
        this.setRequestInterceptor(async req => {
            if(this.accessTokenExpired() && req.url !==  "auth/token") {
                const auth =  await this.refreshAccessToken();
                req.headers["Authorization"] = `Bearer ${auth.access_token}`
                if(this.integrationModel) {
                    await this.integrationModel.set({
                        auth: JSON.stringify(auth) ,
                        last_token_refresh: moment().unix()
                    })
                }
            }
            return req;
        })
    }
     setIntegrationModel(model) {
        this.integrationModel = model;
        return this;
     }
    getApiBaseUrl() {
        return {
            sandbox: "https://sandbox-b2b.revolut.com/api/1.0",
            production: "https://b2b.revolut.com/api/1.0"
        }[this.config.environment]
    }
    getConnectBaseUrl() {
        return {
            sandbox: "https://sandbox-business.revolut.com",
            production: "https://business.revolut.com"
        }[this.config.environment]
    }
    getConnectUrl() {
        if(this.config.client_assertion_jwt && this.config.client_id) {
            return `${this.getConnectBaseUrl()}/app-confirm?client_id=${this.config.client_id}&response_type=code`
        }
        return null;
    }
    getAuth() {
        return this.config && this.config.auth
            ? JSON.parse(this.config.auth)
            : {}
    }
    getConfig() {
        return this.config && this.config.config
            ? this.config.config
            : {}
    }
    getHeaders() {
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        };
        const auth = this.getAuth();
        if(auth.access_token) {
            headers["Authorization"] = `Bearer ${auth.access_token}`;
        }
        return headers;
    }
    accessTokenExpired() {
        const auth = this.getAuth();
        return moment().isSameOrAfter(moment.unix(auth.created_at + auth.expires_in));
    }
    sendResponse(response) {
        response = typeof response.data === "string" ? JSON.parse(response.data) : response.data
        if(response.error && response.error_description) throw new Error(response.error_description);
        if(response.code && response.message) throw new Error(response.message)
        return response;
    }

    async getAccessToken(code) {
        let auth = this.sendResponse(
            await this.setHeader("Content-Type", "application/x-www-form-urlencoded")
                .rawPost("auth/token", qs.stringify({
                    grant_type: "authorization_code",
                    code: code,
                    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                    client_assertion: this.config.client_assertion_jwt
                }))
        );
        auth.created_at = moment().unix()
        return auth;
    }
    async refreshAccessToken() {
        let auth = this.sendResponse(
            await this.setHeader("Content-Type", "application/x-www-form-urlencoded")
            .rawPost("auth/token", qs.stringify({
                grant_type: "refresh_token",
                refresh_token: this.getAuth().refresh_token,
                client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                client_assertion: this.config.client_assertion_jwt
            }))
        )
        auth.refresh_token = this.getAuth().refresh_token;
        auth.created_at = moment().unix()
        return auth;
    }
}

module.exports = RevolutConnect;