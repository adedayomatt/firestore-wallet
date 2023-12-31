const { gql } = require("apollo-server-express");

const schema = gql`
    extend type Query {
        getAdminWallets(id: ID, type: String): [AdminWallet]
        getAdminCollectionWallets(id: ID, type: String): [AdminCollectionWallet]
        getAllEntityTransactions: [EntityTransaction]
        getAllEntityWithdrawalRequests: [EntityWithdrawalRequest]
    }
    extend type Mutation {
        createAdminWallet( wallet_type: String! ): AdminWallet
        createAdminCollectionWallet( name: String!, type: String! ): AdminCollectionWallet
        createEntityTransaction (entity_id: ID!, wallet_id: ID!, data: TransactionInput! ): EntityTransaction
        updateEntityTransaction (entity_id: ID!, transaction_id: ID!, data: TransactionInput! ): EntityTransaction
        fundEntityWallet (entity_id: ID!, entity_wallet_id: ID!, admin_wallet_id: ID!, data: WalletFundingInput!): EntityWallet
        reviewEntityWithdrawalRequest (entity_id: ID!, request_id: ID!, data: WithdrawalRequestReviewInput! ): EntityWithdrawalRequest
    }
        
    input TransactionInput {
        type: String!
        date: String
        title: String
        description: String
        amount: Float
        fees: [MetadataInput]
        metadata: [MetadataInput]
        files: [String]
        extra_fees: [TransactionExtraFeeInput]
    }
    
    type TransactionExtraFee {
      title: String
      amount: Float
      fees: [Metadata]
     }
     
   input TransactionExtraFeeInput {
        title: String
        amount: Float
        fees: [MetadataInput]
    }
    
    type AdminWallet { 
        id: ID!
        amount: Float
        balance: String
        status: String
        processor: String
        type: WalletType
    }
    
    input WalletFundingInput {
        amount: Float!
        comment: String
        send_to_bank: Boolean
        metadata: [MetadataInput]
    }
    
    type WithdrawalRequestReview {
        amount: Float
        status: String
        title: String
        description: String
        files: [String]
        reviewed_at: Int
        reviewed_by: Entity
    }
    
    input WithdrawalRequestReviewInput {
        amount: Float
        status: String
        title: String
        description: String
        files: [String]
    }
    
    type AdminCollectionWallet { 
        id: ID!
        name: String
        amount: Float
        suspended: Float
        blocked: Float
        available: Float
        status: String
        type: WalletType
        metadata: [Metadata]
        connection: String
        timestamp: Timestamp
    }
`;

module.exports = schema;