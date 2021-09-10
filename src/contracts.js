const { defineReadOnly } = require("@ethersproject/properties")
const contractsMod = require("@ethersproject/contracts")

function overwriteContractsMod() {
    _oContractFactoryDeploy()
}

function _oContractFactoryDeploy() {
    const { Logger } = require("@ethersproject/logger")
    const logger = new Logger("cfx_overwrite");

    contractsMod.ContractFactory.prototype.deploy = async function (...args) {
        let overrides = {};

        // If 1 extra parameter was passed in, it contains overrides
        if (args.length === this.interface.deploy.inputs.length + 1) {
            overrides = args.pop();
        }

        // Make sure the call matches the constructor signature
        logger.checkArgumentCount(args.length, this.interface.deploy.inputs.length, " in Contract constructor");

        const params = [...args]
        params.push(overrides);

        // Get the deployment transaction (with optional overrides)
        const unsignedTx = this.getDeployTransaction(...params);

        // Send the deployment transaction
        const tx = await this.signer.sendTransaction(unsignedTx);

        const { contractAddress } = await tx.wait(1)

        const contract = contractsMod.ContractFactory.getContract(contractAddress, this.interface, this.signer)
        defineReadOnly(contract, "deployTransaction", tx);
        return contract;
    }
}

module.exports = { overwriteContractsMod }