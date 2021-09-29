const { isValidCfxAddress, formatHexAddress,requireIfy } = require("../utils")
const bytesMod = requireIfy("@ethersproject/bytes")
const debug = require("debug")("path/bytes")

function overwriteBytesMod() {
    if(!bytesMod){
        debug("bytes Mod not exist")
        return 
    }
    _oHexlify()
}

function _oHexlify() {
    const oldMethod = bytesMod.hexlify

    bytesMod.hexlify = function (value, options) {
        if (isValidCfxAddress(value)) {
            value = formatHexAddress(value)
        }
        return oldMethod(value, options)
    }
}

module.exports = { overwriteBytesMod }