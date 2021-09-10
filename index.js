const patch = require("./patch")
patch()

const { CfxWallet } = require("./cfxWallet")
const utils = require("./utils")

module.exports = {
    CfxWallet,
    utils
}