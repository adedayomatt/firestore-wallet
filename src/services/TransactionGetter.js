const transactionTypes = require("../enums/transaction_types");

class TransactionGetter {
    constructor(transaction) {
        this.transaction = transaction
    }
    static getFeeAmount(fees, feeName) {
        const fee = fees.find(f => f.key === feeName)
        return fee && fee.hasOwnProperty('value')
            ? parseFloat(fee.value || "0")
            : 0;
    }

    getAmount() {
        return parseFloat(this.transaction.amount || "0")
    }
    hasExtraFees() {
     return Boolean(this.transaction.extra_fees);
    }
    getTotalInflow() {
        let total = 0;
        if(this.transaction.inflow) total = parseFloat(this.transaction.inflow || "0");
        else if ([
            transactionTypes.inflow, transactionTypes.funding
        ].includes(this.transaction.type)) {
            total =  this.getAmount()
        }
        total += this.getExtraFeeInflow();
        return total;
    }

    getTotalOutflow() {
        let total = 0;
        if(this.transaction.outflow) total = parseFloat(this.transaction.outflow || "0");
        else if ([
            transactionTypes.outflow, transactionTypes.payout
        ].includes(this.transaction.type)) {
            total =  this.getAmount()
        }
        total += this.getExtraFeeOutflow() + this.getTotalFee();
        return total;
    }

    getTotalFee() {
        let total = 0;
        for(let fee of (this.transaction.fees || [])) {
            total += parseFloat(fee.value || "0")
        }
        return total;
    }

    getExtraFeeInflow() {
        let total = 0;
        if(this.transaction.extra_fees) {
            for(let extraFee of (this.transaction.extra_fees || [])) {
                total += parseFloat(extraFee.amount || "0");
            }
        }
        return total;
    }
    getExtraFeeOutflow() {
        let total = 0;
        if(this.transaction.extra_fees) {
            for(let extraFee of (this.transaction.extra_fees || [])) {
                total += (extraFee.fees || [])
                    .map(fee => parseFloat(fee.value || "0"))
                    .reduce((a,b) => a+b, 0)
            }
        }
        return total;
    }
    getExtraFeeNet() {
        return this.getExtraFeeInflow() - this.getExtraFeeOutflow();
    }

    getNet() {
        return this.getTotalInflow() - this.getTotalOutflow();
    }

    getTotalSpecificFee(feeName) {
        let total = TransactionGetter.getFeeAmount(this.transaction.fees || [], feeName);
        if(this.hasExtraFees()) {
            for(let extraFee of (this.transaction.extra_fees || [])) {
                total += TransactionGetter.getFeeAmount(extraFee.fees || [], feeName)
            }
        }
        return total;
    }
}

module.exports = TransactionGetter