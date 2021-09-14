const addressMod = require("@ethersproject/address")
const { isCfxTransaction, isValidCfxAddress, calcContractAddress } = require("../utils")

function overwriteAddressMod() {
    _oGetAddress()
    _oGetContractAddress()
}

function _oGetAddress() {
    const oldMethod = addressMod.getAddress
    addressMod.getAddress = function (address) {
        if (isValidCfxAddress(address)) {
            return address
        }
        return oldMethod(address)
    }
}

function _oGetContractAddress() {
    const oldMethod = addressMod.getContractAddress
    addressMod.getContractAddress = function (transaction) {
        if (isCfxTransaction(transaction)) {
            let { from, nonce, data } = transaction
            return calcContractAddress(from, nonce, data)
        }
        return oldMethod(transaction)
    }
}

module.exports = { overwriteAddressMod }