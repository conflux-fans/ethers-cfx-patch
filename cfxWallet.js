const { Wallet } = require("@ethersproject/wallet")
const { keccak256 } = require("@ethersproject/keccak256")
const { Transaction, format } = require("js-conflux-sdk")
const { computeAddress } = require("@ethersproject/transactions")
const { computeCfxAddress } = require("./utils")
const { defineReadOnly } = require("@ethersproject/properties")
const { SigningKey } = require("@ethersproject/signing-key")
const { HDNode, entropyToMnemonic } = require("@ethersproject/hdnode")
const { arrayify, concat, hexDataSlice, isHexString } = require("@ethersproject/bytes")
const { randomBytes } = require("@ethersproject/random")
const { decryptJsonWallet, decryptJsonWalletSync, } = require("@ethersproject/json-wallets")
const { CFXMnemonicPath } = require("./utils")
const { Logger } = require("@ethersproject/logger");
const debug = require("debug")("cfxwallet")

const logger = new Logger("cfxwallet")

function isAccount(value) {
    return (value != null && isHexString(value.privateKey, 32) && value.address != null);
}

function hasMnemonic(value) {
    const mnemonic = value.mnemonic;
    return (mnemonic && mnemonic.phrase);
}

function resetPropertyValue(object, name, value) {
    let pro = Object.getOwnPropertyDescriptor(object, name)
    if (pro && pro.configurable) {
        Object.defineProperty(object, 'address',
            { ...pro, value });
        return
    }
    if (!pro) {
        object[name] = value
    }
}


class CfxWallet extends Wallet {

    constructor(privateKey, provider, networkId) {

        // 先判断address是否cfxaddress或ethaddress，不是报错，是的话把把address转成eth hex
        if (isAccount(privateKey)) {
            const signingKey = new SigningKey(privateKey.privateKey);
            const pubKey = signingKey.publicKey;
            const cfxAddress = computeCfxAddress(pubKey, networkId)
            if (cfxAddress !== privateKey.address &&
                computeAddress(pubKey) !== privateKey.address) {
                logger.throwArgumentError("privateKey/address mismatch", "privateKey", {
                    cfxAddress,
                    rawAddress: privateKey.address
                });
            }

            resetPropertyValue(privateKey, 'address', computeAddress(signingKey.publicKey))

            if (hasMnemonic(privateKey)) {
                const mnemonic = privateKey.mnemonic;
                resetPropertyValue(mnemonic, 'path', mnemonic.path || CFXMnemonicPath)
            }
        }
        super(privateKey, provider)

        // 然后再设置为cfxaddress
        defineReadOnly(this, "address", computeCfxAddress(this.publicKey, networkId));
        defineReadOnly(this, "networkId", networkId);
    }

    connect(provider) {
        return new CfxWallet(this, provider, this.networkId)
    }

    async populateTransaction(transaction) {

        transaction = await super.populateTransaction(transaction)
        transaction.gas = transaction.gas || transaction.gasLimit
        transaction = format.callTx(transaction)

        let { storageCollateralized } = await this.provider.send("cfx_estimateGasAndCollateral", [transaction])

        if (transaction.storageLimit === undefined) {
            transaction.storageLimit = storageCollateralized
        }

        if (transaction.epochHeight === undefined) {
            const epochNum = await this.provider.getBlockNumber()
            transaction.epochHeight = epochNum
        }

        return transaction
    }

    signTransaction(transaction) {
        let tx = new Transaction({ ...transaction })
        tx.gas = tx.gas || tx.gasLimit

        // 不破坏原有行为，如助记词签名等
        const txhash = keccak256(tx.encode(false))
        const sig = this._signingKey().signDigest(txhash);
        [tx.r, tx.s, tx.v] = [sig.r, sig.s, sig.v - 27]

        debug('cfx signtx %o', { txhash, sign: tx.sign(this._signingKey().privateKey, Number.parseInt(tx.chainId)) })
        debug('eth signtx %o', { txhash, tx, recover: tx.recover() })

        return Promise.resolve(tx.serialize())
    }

    static createRandom(options, networkId) {
        let entropy = randomBytes(16);

        if (!options) { options = {}; }

        if (options.extraEntropy) {
            entropy = arrayify(hexDataSlice(keccak256(concat([entropy, options.extraEntropy])), 0, 16));
        }

        const mnemonic = entropyToMnemonic(entropy, options.locale);
        return CfxWallet.fromMnemonic(mnemonic, options.path, options.locale, networkId);
    }

    static fromEncryptedJson(json, password, progressCallback, networkId) {
        return decryptJsonWallet(json, password, progressCallback).then((account) => {
            return new CfxWallet(account, null, networkId);
        });
    }

    static fromEncryptedJsonSync(json, password, networkId) {
        return new CfxWallet(decryptJsonWalletSync(json, password), null, networkId);
    }

    static fromMnemonic(mnemonic, path, wordlist, networkId) {
        if (!path) { path = CFXMnemonicPath }
        return new CfxWallet(HDNode.fromMnemonic(mnemonic, null, wordlist).derivePath(path), null, networkId);
    }

}

module.exports = { CfxWallet }