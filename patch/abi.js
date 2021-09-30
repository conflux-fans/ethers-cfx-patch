const { isValidCfxAddress, formatHexAddress, requireIfy } = require("../utils")
const addressCoderMod = requireIfy("@ethersproject/abi/lib/coders/address")
const debug = require("debug")("path/abi")

function overwriteAbiMod() {
    if(!addressCoderMod){
        debug("address coder mod not exist")
        return 
    }
    _oEncode(addressCoderMod)
}

function _oEncode(mod) {
    const oldMethod = mod.AddressCoder.prototype.encode
    mod.AddressCoder.prototype.encode = function (writer, value) {
        if (isValidCfxAddress(value)) {
            value = formatHexAddress(value)
        }
        return oldMethod(writer, value)
    }
}

module.exports = { overwriteAbiMod }