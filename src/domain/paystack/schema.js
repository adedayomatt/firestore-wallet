const { gql } =  require('apollo-server-express');

const schema = gql`

    extend type Query {
      paystackGetBanks(entity_id: ID): [PaystackBank]
    }

    extend type Mutation {
        paystackValidateNuban(entity_id: ID, nuban: String!, bank_code: String!): PaystackNubanValidation
        paystackCreateTransfer(entity_id: ID, amount: Float!, recipient: String!): PaystackTransfer
        paystackCreateTransferRecipient(entity_id: ID, name: String!, account_number: String!, bank_code: String!): PaystackTransferRecipient
    }

    type PaystackBank {
        id: ID
        name: String
        code: String
        active: Boolean
        currency: String
        type: String
    }
    
    type PaystackNubanValidation {
        account_number: String
        account_name: String
        bank_id: ID
    }
    
    type PaystackTransferRecipient {
        active: Boolean
        createAt: String
        currency: String
        domain: String
        id: ID
        integration: ID
        name: String
        recipient_code: String
        type: String
        updatedAt: String
        is_deleted: Boolean
        details: PaystackTransferRecipientDetails
    }
    
    type PaystackTransferRecipientDetails {
        authorization_code: String
        account_number: String
        account_name: String
        bank_code: String
        bank_name: String
    }
    
    type PaystackTransfer {
        reference: String
        integration: ID
        domain: String
        amount: Float
        currency: String
        source: String
        reason: String
        recipient: ID
        status: String
        transfer_code: String
        id: ID
        createdAt: String
        updatedAt: String
    }
    
    input PaystackNubanInput {
        account_name: String!
        account_number: String!
        bank_code: String!
    }
`;

module.exports = schema;
