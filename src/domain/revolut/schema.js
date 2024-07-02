const { gql } =  require('apollo-server-express');

const schema = gql`

    extend type Mutation {
        revolutValidateAccountName(entity_id: ID, account_details: RevolutAccountNameValidationInput!): RevolutAccountNameValidation
    }
    
    type RevolutAccountNameValidation {
        result_code: String
        company_name: String
        reason: RevolutAccountNameValidationReason
    }
    
    type RevolutAccountNameValidationReason {
        type: String
        code: String
    }
    
    input RevolutAccountNameValidationInput {
        account_no: String!
        sort_code: String!
        individual_name: RevolutIndividualNameInput
        company_name: String
    }
    
    input RevolutIndividualNameInput {
        first_name: String
        last_name: String
    }
    
    input RevolutAddressInput {
        street_line1: String
        street_line2: String
        region: String
        city: String
        country: String!
        postcode: String!
    }
    
    type RevolutCounterParty {
        id: String
        name: String
        revtag: String
        profile_type: String
        country: String
        state: String
        created_at: String
        updated_at: String
        accounts: [RevolutCounterPartyAccount]
    }
    
    type RevolutCounterPartyAccount {
        id: String
        name: String
        bank_country: String
        currency: String
        type: String
        account_no: String
        iban: String
        sort_code: String
        routing_number: String
        bic: String
        clabe: String
        ifsc: String
        bsb_code: String
        recipient_charges: String
    }
    
    input RevolutCounterPartyInput {
        profile_type: String!
        name: String
        company_name: String
        individual_name: RevolutIndividualNameInput
        phone: String
        bank_country: String
        currency: String
        revtag: String
        account_no: String
        sort_code: String
        routing_number: String
        address: RevolutAddressInput
    }
    
`;

module.exports = schema;
