const { formatHexAddressIfy, isValidCfxAddress, requireIfy } = require("../utils")
const providersMod = requireIfy("@ethersproject/providers")
const debug = require("debug")("path/providers")

function overwriteProvidersMod() {
    if(!providersMod){
        debug("providers mod not exist")
        return 
    }
    _oFormatterTransactionResponse()
    _oJsonRpcProviderHexlifyTransaction()
    _oBaseProviderGetAddress()
}

function _oFormatterTransactionResponse() {
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

function _oJsonRpcProviderHexlifyTransaction() {
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

function _oBaseProviderGetAddress() {
    let oldMethod = providersMod.BaseProvider.prototype._getAddress
    providersMod.BaseProvider.prototype._getAddress = function (addressOrName) {
        if (isValidCfxAddress(addressOrName)) {
            return addressOrName
        }
        return oldMethod.call(this, addressOrName)
    }
}

module.exports = { overwriteProvidersMod }