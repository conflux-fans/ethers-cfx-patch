const { format } = require("js-conflux-sdk");
const { ethAddressToCfxAddress, isValidCfxAddress, decodeCfxAddress } = require("js-conflux-sdk").address
const { computeAddress } = require("@ethersproject/transactions")
const { isHexString } = require("@ethersproject/bytes")
const { keccak256 } = require("ethers/lib/utils")
const debug = require("debug")("utils")

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

function formatRecoverTx(tx) {
    let val = {};
    val.to = undefined
    val.gasPrice = 0
    val.gas = 0
    val.value = 0
    val.storageLimit = 0
    val.epochHeight = 0
    val.chainId = 0
    val.data = "0x"
    val.v = 0
    Object.keys(tx).forEach(k => {
        if (tx[k] === "0x") {
            tx[k] = val[k]
        }
    })
    // return format.signTx(tx)
    return tx
}

// bigNumber to Little-ending buffer
function hex2LittleEndingBuffer(input) {
    if (!isHexString(input))
        throw new Error("Invalid hex string")

    return Buffer.from(input.substr(2), 'hex').reverse()
}

function calcContractAddress(sender, nonce, initCode) {
    // keccak256(from + nonce_le + codehash).slice(20), then set first 4bits be 8
    debug("calcContractAddress %o", { sender, nonce, initCode })
    const hexFrom = format.hexAddress(sender)
    const nonce_le = hex2LittleEndingBuffer(format.hex(nonce))
    const initCodeBytes = Buffer.from(initCode.substr(2), 'hex')
    const codehash = keccak256(initCodeBytes)

    const buf = Buffer.alloc(1 + 20 + 32 + 32)

    Buffer.from(hexFrom.substr(2), 'hex').copy(buf, 1)
    nonce_le.copy(buf, 1 + 20)
    Buffer.from(codehash.substr(2), 'hex').copy(buf, 1 + 20 + 32)

    const hash = keccak256(buf)
    const hexAddr = Buffer.from(hash.substr(2), 'hex').slice(-20)
    hexAddr[0] = (hexAddr[0] & 0x8f) | 0x80

    const { netId } = decodeCfxAddress(sender)
    const contractAddress = format.address('0x' + hexAddr.toString('hex'), netId)

    debug({
        initCode,
        initCodeBytes,
        codehash,
        buffer: buf.toString('hex'),
        hexAddr: '0x' + hexAddr.toString('hex'),
        contractAddress
    })

    return contractAddress
}


module.exports = {
    isCfxTransaction,
    isValidCfxAddress,
    formatCfxAddress: format.address,
    formatHexAddress: format.hexAddress,
    formatHexAddressIfy,
    formatCfxAddressIfy,
    formatRecoverTx,
    CFXMnemonicPath: "m/44'/503'/0'/0/0",
    computeCfxAddress,
    hex2LittleEndingBuffer,
    calcContractAddress
}