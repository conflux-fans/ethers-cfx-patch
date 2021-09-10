const cfxsdk = require("js-conflux-sdk");
const { isValidCfxAddress } = cfxsdk.address
const { format } = cfxsdk

function isCfxTransaction(transaction) {
    for (let k of ["storageLimit", "gas", "epochHeight"]) {
        if (transaction[k] !== undefined) {
            return true
        }
    }

    for (let k of ["from", "to"]) {
        if (isValidCfxAddress(transaction[k])) {
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
    CFXMnemonicPath: "m/44'/503'/0'/0/0"
}