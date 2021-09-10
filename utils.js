const { format } = require("js-conflux-sdk");
const { ethAddressToCfxAddress, isValidCfxAddress } = require("js-conflux-sdk").address
const { computeAddress } = require("@ethersproject/transactions")

function computeCfxAddress(key, networkId) {
    let ethAddress = computeAddress(key)
    const cfxHexAddress = ethAddressToCfxAddress(ethAddress)
    return format.address(cfxHexAddress, networkId)
}

function isCfxTransaction(transaction) {
    for (let v of ["storageLimit", "gas", "epochHeight"]) {
        if (transaction[v] !== undefined) {
            return true
        }
    }

    for (let v of ["from", "to"]) {
        if (isValidCfxAddress(transaction[v])) {
            return true
        }
    }

    return false
}

function formatHexAddressIfy(address) {
    if (address == "0x") return null
    return address && format.hexAddress(address)
}

function formatCfxAddressIfy(address, networkId) {
    if (address == "0x") return null
    return address && format.address(address, networkId)
}

module.exports = {
    isCfxTransaction,
    isValidCfxAddress,
    formatCfxAddress: format.address,
    formatHexAddress: format.hexAddress,
    formatHexAddressIfy,
    formatCfxAddressIfy,
    CFXMnemonicPath: "m/44'/503'/0'/0/0",
    computeCfxAddress
}