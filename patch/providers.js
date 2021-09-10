const { formatHexAddressIfy } = require("../utils")
const providersMod = require("@ethersproject/providers")

function overwriteProvidersMod() {
    _oFormatterTransactionResponse()
    _oJsonRpcProviderHexlifyTransaction()
}

function _oFormatterTransactionResponse(){
    let oldMethod = providersMod.Formatter.prototype.transactionResponse
    providersMod.Formatter.prototype.transactionResponse = function (transaction) {
        transaction.creates = transaction.creates || transaction.contractCreated
        
        let { to } = transaction
        transaction.to = formatHexAddressIfy(to)
        oldMethod.call(this, transaction)
        transaction.to = to
        
        return transaction
    }
}

function _oJsonRpcProviderHexlifyTransaction(){
    let oldMethod = providersMod.JsonRpcProvider.hexlifyTransaction
    providersMod.JsonRpcProvider.hexlifyTransaction = function (transaction, allowExtra) {
        let { from, to } = transaction
        transaction.from = formatHexAddressIfy(from)
        transaction.to = formatHexAddressIfy(to)

        let hexlified = oldMethod.call(this, transaction, allowExtra);
        [hexlified.from, hexlified.to] = [from, to]
        return hexlified
    }
}

module.exports = { overwriteProvidersMod }