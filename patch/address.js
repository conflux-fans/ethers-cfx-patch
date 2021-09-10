const addressMod = require("@ethersproject/address")
const { isCfxTransaction, isValidCfxAddress } = require("../utils")

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
            throw new Error("could not get contract address by address and nonce in conflux network")
        }
        return oldMethod(transaction)
    }
}

module.exports = { overwriteAddressMod }