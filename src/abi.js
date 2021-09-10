const { isValidCfxAddress, formatHexAddress } = require("./common")
const addressCoderMod = require("@ethersproject/abi/lib/coders/address")

function overwriteAbiMod() {
    _oEncode()
}

function _oEncode() {
    const oldMethod = addressCoderMod.AddressCoder.prototype.encode
    addressCoderMod.AddressCoder.prototype.encode = function (writer, value) {
        if (isValidCfxAddress(value)) {
            value = formatHexAddress(value)
        }
        return oldMethod(writer, value)
    }
}

module.exports = { overwriteAbiMod }