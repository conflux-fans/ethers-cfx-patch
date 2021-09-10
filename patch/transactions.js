const cfxsdk = require("js-conflux-sdk");
const { RLP } = require("ethers/lib/utils");
const { isCfxTransaction, formatCfxAddressIfy } = require("../utils")
const txsMod = require("@ethersproject/transactions")
const bytesMod = require("@ethersproject/bytes")
const { keccak256 } = require("@ethersproject/keccak256")

function overwriteTransactionsMod() {
    _oParse()
    _oSerialize()
}

function _oParse() {
    // 替换Parse，pase作用是rawTx->tx
    const oldMethod = txsMod.parse
    txsMod.parse = function (rawTransaction) {
        let [utx, v, r, s] = RLP.decode(rawTransaction)
        if (utx.length == 9) {
            let [nonce, gasPrice, gas, to, value, storageLimit, epochHeight, chainId, data] = utx
            let tx = {
                nonce, gasPrice, gas, to, value, storageLimit, epochHeight, chainId, data, v, r, s
            }
            let ethtx = {
                ...tx,
                gasLimit: tx.gas,
                to: formatCfxAddressIfy(tx.to, Number.parseInt(tx.chainId)),
                hash: keccak256(rawTransaction)
            }
            return ethtx
        }
        return oldMethod(rawTransaction)
    }
}

function _oSerialize() {
    const oldMethod = txsMod.serialize
    txsMod.serialize = function (utx, sig) {
        if (isCfxTransaction(utx)) {
            utx.gas = utx.gas || utx.gasLimit
            const _tx = new cfxsdk.Transaction({ ...utx, ...sig })
            // console.log("formated tx", _tx)
            const signedBuff = _tx.encode(!!sig)
            return bytesMod.hexlify(signedBuff)
        }
        return oldMethod(utx, sig)
    }
}

module.exports = { overwriteTransactionsMod }