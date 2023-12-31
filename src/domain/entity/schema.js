const {gql} = require("apollo-server-express");

const entity = gql`

    extend type Query {    
        getEntityWithdrawalRequests(entity_id: ID, wallet_id: ID): [EntityWithdrawalRequest]
        getEntityTransactions(entity_id: ID, wallet_id: ID): [EntityTransaction]
     }

    extend type Mutation {
        createEntityWallet (entity_id: ID, wallet_type: String! ): EntityWallet
        createEntityWithdrawalRequest ( entity_id: ID, wallet_id: ID!, data: EntityWithdrawalRequestInput! ): EntityWithdrawalRequest
        connectEntityNgnWallet (entity_id: ID, name: String!, account_number: String!, bank_code: String!): EntityWallet
        disconnectEntityNgnWallet(entity_id: ID): EntityWallet
        connectEntityUsdWallet (entity_id: ID, authorization_code: String!): EntityWallet
        disconnectEntityUsdWallet (entity_id: ID): EntityWallet
        connectEntityGbpWallet (entity_id: ID, account_details: RevolutCounterPartyInput!): EntityWallet
        disconnectEntityGbpWallet (entity_id: ID): EntityWallet
    }

    type Entity { 
        id: ID!
        wallets: [EntityWallet]
        transactions: [EntityTransaction]
        metadata: [Metadata]
    }
    
    type EntityWallet { 
        id: ID!
        amount: Float
        suspended: Float
        blocked: Float
        available: Float
        status: String
        type: WalletType
        entity: Entity
        metadata: [Metadata]
        connection: String
        timestamp: Timestamp
    }
    
   type EntityWithdrawalRequest {
        id: ID!
        amount: Float
        method: String
        status: String
        bank_account: BankDetail
        credit_card: CardDetail
        entity: Entity
        wallet: EntityWallet
        review: WithdrawalRequestReview
        metadata: [Metadata]
        timestamp: Timestamp
    }
    
    input EntityWithdrawalRequestInput {
        amount: Float!
        method: String
        bank_account: BankDetailInput
        credit_card: CardDetailInput
        metadata: [MetadataInput]
    }
    
    type EntityTransaction {
        id: ID!
        type: String
        amount: Float
        inflow: Float
        outflow: Float
        net: Float
        date: String
        title: String
        description: String
        status: String
        fees: [Metadata]
        extra_fees: [TransactionExtraFee]
        fees_total: Float
        extra_fees_income: Float
        extra_fees_expense: Float
        extra_fees_net: Float
        files: [String]
        entity: Entity
        wallet: EntityWallet
        metadata: [Metadata]
        timestamp: Timestamp
    } 
`;

module.exports = entity;