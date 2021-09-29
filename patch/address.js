const { isCfxTransaction, isValidCfxAddress, calcContractAddress,requireIfy } = require("../utils")
const addressMod = requireIfy("@ethersproject/address")
const debug = require("debug")("path/address")

function overwriteAddressMod() {
    if(!addressMod){
        debug("address mod not exist")
        return 
    }
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