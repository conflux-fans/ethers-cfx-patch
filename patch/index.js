console.log("bbb")
const { overwriteAbiMod } = require("./abi")
const { overwriteAddressMod } = require("./address")
const { overwriteBytesMod } = require("./bytes")
const { overwriteContractsMod } = require("./contracts")
const { overwriteProvidersMod } = require("./providers")
const { overwriteTransactionsMod } = require("./transactions")
const { overwritePropertiesMod } = require("./properties")

function patch() {
    console.log("patch")
    overwritePropertiesMod()
    overwriteAbiMod()
    overwriteAddressMod()
    overwriteBytesMod()
    overwriteContractsMod()
    overwriteProvidersMod()
    overwriteTransactionsMod()
}

module.exports = patch