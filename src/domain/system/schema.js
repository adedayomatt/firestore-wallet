const {gql} = require("apollo-server-express");

const schema = gql`
    extend type Query {
        getPaystackIntegration: PaystackIntegration
        getStripeIntegration: StripeIntegration
        getRevolutIntegration: RevolutIntegration
        getAdminFeeCollectionConfig: AdminFeeCollectionConfig
    }
    
    extend type Mutation {
        setPaystackIntegration(data: PaystackIntegrationInput!): PaystackIntegration
        setStripeIntegration(data: StripeIntegrationInput!): StripeIntegration
        setRevolutIntegration(data: RevolutIntegrationInput!): RevolutIntegration
        authorizeRevolut(authorization_code: String!): RevolutIntegration
        revokeRevolut: RevolutIntegration
        setAdminFeeCollectionConfig(data: AdminFeeCollectionConfigInput!): AdminFeeCollectionConfig
    }
    
    type PaystackIntegration {
        enabled: Boolean
        public_key: String
        secret_key: String
    }
    
     input PaystackIntegrationInput {
        enabled: Boolean
        public_key: String
        secret_key: String
    }
    
    type StripeIntegration {
      enabled: Boolean
      publishable_key: String
      connect_client_id: String
      secret_key: String
    }
    
    input StripeIntegrationInput {
      enabled: Boolean
      publishable_key: String
      connect_client_id: String
      secret_key: String
    }
    
    type RevolutIntegration {
      enabled: Boolean
      environment: String
      client_id: String
      domain: String
      jwt_expiration_days: Int
      connect_url: String
      authorized: Boolean
      client_assertion_jwt: String
      config: RevolutIntegrationConfig
    }
    
    type RevolutIntegrationConfig {
        payment_source_account_id: ID
        payment_charge_bearer: String
    }
    
    input RevolutIntegrationInput {
      enabled: Boolean
      environment: String
      client_id: String
      client_assertion_jwt: String
      config: RevolutIntegrationConfigInput
    }
    
    input RevolutIntegrationConfigInput {
        payment_source_account_id: ID
        payment_charge_bearer: String
    }
    
    type AdminFeeCollectionConfig {
          usd: AdminCurrencyFeeCollectionConfig
          ngn: AdminCurrencyFeeCollectionConfig
          gbp: AdminCurrencyFeeCollectionConfig
    }
    
    input AdminFeeCollectionConfigInput {
          usd: AdminCurrencyFeeCollectionConfigInput
          ngn: AdminCurrencyFeeCollectionConfigInput
          gbp: AdminCurrencyFeeCollectionConfigInput
    }
    
    type AdminCurrencyFeeCollectionConfig {
          tax_fee_wallet: ID
          management_fee_wallet: ID
    }
    
    input AdminCurrencyFeeCollectionConfigInput {
          tax_fee_wallet: ID
          management_fee_wallet: ID
    }
`;

module.exports = schema;