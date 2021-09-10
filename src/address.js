
const cfxsdk = require("js-conflux-sdk");
const addressMod = require("@ethersproject/address")
const { isCfxTransaction } = require("./common")

function overwriteAddressMod() {
    _oGetAddress()
    _oGetContractAddress()
}

function _oGetAddress() {
    const oldMethod = addressMod.getAddress
    addressMod.getAddress = function (address) {
        // return address
        // console.log("getAddress of", address)
        // console.log("is cfx address", cfxsdk.address.isValidCfxAddress(address))
        if (cfxsdk.address.isValidCfxAddress(address)) {
            return address
        }
        return oldMethod(address)
    }
}

function _oGetContractAddress() {
    const oldMethod = addressMod.getContractAddress
    addressMod.getContractAddress = function (transaction) {
        // 判断cfx tx
        // ["storageLimit", "gas", "epochHeight"].forEach(k => {
        //     if (transaction[k] !== undefined) {
        //         throw new Error("could not get contract address by address and nonce in conflux network")
        //     }
        // })
        if (isCfxTransaction) {
            throw new Error("could not get contract address by address and nonce in conflux network")
        }
        return oldMethod(transaction)
    }
}

module.exports = { overwriteAddressMod }