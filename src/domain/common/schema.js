const { gql } =  require('apollo-server-express');

const schema = gql`

     type Metadata {
         key: String,
         value: String
     }
     
     input MetadataInput {
         key: String,
         value: String
     }
    
      
    type Pagination {
      page: Int
      size: Int
      offset: Int
      total: Int
    }
    
     input PaginationInput {
      size: Int
      page: Int
    }
    
   type BankDetail {
        account_name: String
        account_number: String
        bank: String
    }
    
    input BankDetailInput {
        account_name: String
        account_number: String
        bank: String
    }
    
    type CardDetail {
        card_number: String
        expiry_date: String
        cvv: String
        zip_code: String
    }
    
    input CardDetailInput {
        card_number: String
        expiry_date: String
        cvv: String
        zip_code: String
    }
    
   type WalletType {
        id: String
        name: String
        currency: String
        currency_symbol: String
        colors: [String]
    }
    
    type Timestamp {
        created_at: Int
        updated_at: Int
        deleted_at: Int
    }
   `
;

module.exports = schema;
