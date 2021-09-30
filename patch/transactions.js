const { isCfxTransaction, formatCfxAddressIfy, formatCfxAddress, formatRecoverTx, isPackagesExist } = require("../utils")
const debug = require("debug")("patch/transactions")
if (!_isAllPackagesExists()) return

const cfxsdk = require("js-conflux-sdk");
const RLP = require("@ethersproject/rlp");
const txsMod = require("@ethersproject/transactions")
const bytesMod = require("@ethersproject/bytes")
const { keccak256 } = require("@ethersproject/keccak256")
const { Transaction } = require("js-conflux-sdk")
const { publicKeyToAddress } = cfxsdk.sign;


function overwriteTransactionsMod() {
    _oParse()
    _oSerialize()
}

function _oParse() {
    // 替换Parse，pase作用是rawTx->tx
    const oldMethod = txsMod.parse
    txsMod.parse = function (rawTransaction) {
        const [utx, v, r, s] = RLP.decode(rawTransaction)
        debug("decoded transaction: %o", [utx, v, r, s])
        if (utx.length == 9) {
            const [nonce, gasPrice, gas, to, value, storageLimit, epochHeight, chainId, data] = utx
            const tx = {
                nonce, gasPrice, gas, to, value, storageLimit, epochHeight, chainId, data, v, r, s
            }

            let fTx = formatRecoverTx(tx)
            debug('formated tx for recover %o', fTx)
            const publicKey = new Transaction(fTx).recover()

            const hexFrom = publicKeyToAddress(Buffer.from(publicKey.substr(2), 'hex'))
            const cfxFrom = formatCfxAddress(hexFrom, Number.parseInt(chainId))
            const cfxTo = formatCfxAddressIfy(tx.to, Number.parseInt(tx.chainId))

            const ethtx = {
                ...tx,
                from: cfxFrom,
                to: cfxTo,
                gasLimit: tx.gas,
                hash: keccak256(rawTransaction)
            }
            debug("adapted ethtx: %o", ethtx)
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
            const signedBuff = _tx.encode(!!sig)
            return bytesMod.hexlify(signedBuff)
        }
        return oldMethod(utx, sig)
    }
}

function _isAllPackagesExists() {
    const result = isPackagesExist(
        [
            "@ethersproject/rlp",
            "@ethersproject/transactions",
            "@ethersproject/bytes",
            "@ethersproject/keccak256"
        ]
    )

    if (!result.isAllExist) {
        debug(`not exist dependencies: ${result.notExists}`)
        module.exports.overwriteTransactionsMod = function () { }
        return false
    }
    return true
}


module.exports = { overwriteTransactionsMod }