const { isValidCfxAddress, formatHexAddress } = require("../utils")
const bytesMod = require("@ethersproject/bytes")

function overwriteBytesMod() {
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