const { CfxWallet, utils } = require("../index")
const { ethers, ContractFactory } = require("ethers");
const JsonRpcProxy = require("web3-providers-http-proxy");

const cfxProxy = new JsonRpcProxy("http://test.confluxrpc.com")
const p = new ethers.providers.Web3Provider(cfxProxy)

let networkId, user, contract, txhash, tx

async function init() {
    networkId = (await p.getNetwork()).chainId
    console.log("networkId: ", networkId)
    user = utils.formatCfxAddress("0x19f4bcf113e0b896d9b34294fd3da86b4adf0302", networkId)
    contract = utils.formatCfxAddress("0x85c1e90cafca11e3ed9486f32750fdefb46f9da", networkId)
    txhash = "0x83d9aa5bdf5e453cbd9c777ebc30cd91ffa407b03080c5bb52cb883a3f448b0b"
    tx = {
        from: user,
        to: utils.formatCfxAddress("0x175c1e90cafca11e3ed9486f32750fdefb46f9da", networkId),
    };
}

(async function run() {
    console.log("start")
    try {
        // await p.getBalance(user)
        await init()
        await basic()
        // await sendTxByRemote()
        // await sendTxByPrivateKey()
        // await sendTxByAccount()
        // await sendTxByHDNode()
        // await doContract()
    } catch (err) {
        console.error(err)
    }
    console.log("end")
})()

async function basic() {

    let logFilter = {}

    console.log("\n- getBlockNumber", await p.getBlockNumber())

    console.log("\n- gasPrice", await p.getGasPrice())

    console.log("\n- getBalance", await p.getBalance(user))

    console.log("\n- getTransactionCount", await p.getTransactionCount(user))

    console.log("\n- getCode", await p.getCode(contract))

    console.log("\n- getStorageAt", await p.getStorageAt(contract, 0))

    console.log("\n- call", await p.call(tx).catch(console.error))

    console.log("\n- estimateGas", await p.estimateGas(tx).catch(console.error))

    console.log("\n- block", await p.getBlock('latest'))

    console.log("\n- getBlockWithTransactions", await p.getBlockWithTransactions('latest'))

    console.log("\n- tx", await p.getTransaction(txhash))

    console.log("\n- getTransactionReceipt", await p.getTransactionReceipt(txhash))

    console.log("\n- getLogs", await p.getLogs(logFilter).catch(console.error))
}

async function sendTxByRemote() {
    console.log("\n- send tx by remote signer")
    let signer = p.getSigner(0)
    await signer.unlock("hello")
    let tx = {
        from: await signer.getAddress(),
        to: utils.formatCfxAddress("0x175c1e90cafca11e3ed9486f32750fdefb46f9da", networkId),
    };
    const balance = await signer.getBalance()
    console.log("account balance", balance)
    if (balance.lte(0)) {
        throw new Error("outof balance")
    }
    let sendedTx = await signer.sendTransaction(tx)
    let receipt = await sendedTx.wait()
    console.log("sendTransaction", { sendedTx, receipt })
}

async function sendTxByPrivateKey() {
    console.log("\n- send tx by cfx wallet")
    let signer = new CfxWallet("0x2139FB4C55CB9AF7F0086CD800962C2E9013E2292BAE77978A9209E3BEE71D49", p, networkId)
    console.log("signer address", await signer.address)
    console.log("sign hello:", await signer.signMessage("hello"))

    // const cfx = new cfxsdk.Conflux({ url: "http://localhost:12537" })
    // await format.formatTxParams(cfx, tx)
    // console.log("sign tx:", await signer.signTransaction(tx))

    const txSended = await signer.sendTransaction({ ...tx, from: signer.address })
    const receipt = await txSended.wait(1)
    console.log("send tx by wallet", { txSended, receipt })
}

async function sendTxByAccount() {
    let key = {
        privateKey: "0x2139FB4C55CB9AF7F0086CD800962C2E9013E2292BAE77978A9209E3BEE71D49",
        address: utils.formatCfxAddress("0x19f4bcf113e0b896d9b34294fd3da86b4adf0302", networkId)
    }
    let signer = new CfxWallet(key, p, networkId)

    let tx = {
        from: await signer.getAddress(),
        to: utils.formatCfxAddress("0x175c1e90cafca11e3ed9486f32750fdefb46f9da", networkId),
    };
    const txSended = await signer.sendTransaction({ ...tx, from: signer.address })
    const receipt = await txSended.wait(1)
    console.log("send tx by HD wallet", { txSended, receipt })
}

async function sendTxByHDNode() {
    let signer = CfxWallet.fromMnemonic("woman trial escape buzz million dog front dizzy buzz rigid fall marble", undefined, undefined, networkId)
    signer = signer.connect(p, networkId)

    let tx = {
        from: signer.address,
        to: utils.formatCfxAddress("0x175c1e90cafca11e3ed9486f32750fdefb46f9da", networkId),
    };

    const txSended = await signer.sendTransaction({ ...tx, from: signer.address })
    const receipt = await txSended.wait(1)
    console.log("send tx by HD wallet", { txSended, receipt })
}

async function doContract() {
    // deploy
    console.log("\n- deploy contract")
    const abi = [{ "inputs": [{ "internalType": "string", "name": "_symbol", "type": "string" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "sendCoin", "outputs": [{ "internalType": "bool", "name": "sufficient", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "addr", "type": "address" }], "name": "getBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]
    const bytecode = "0x608060405234801561001057600080fd5b506040516107a93803806107a98339818101604052810190610032919061019f565b8060019080519060200190610048929190610094565b506127106000803273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050610304565b8280546100a090610274565b90600052602060002090601f0160209004810192826100c25760008555610109565b82601f106100db57805160ff1916838001178555610109565b82800160010185558215610109579182015b828111156101085782518255916020019190600101906100ed565b5b509050610116919061011a565b5090565b5b8082111561013357600081600090555060010161011b565b5090565b600061014a61014584610211565b6101e0565b90508281526020810184848401111561016257600080fd5b61016d848285610241565b509392505050565b600082601f83011261018657600080fd5b8151610196848260208601610137565b91505092915050565b6000602082840312156101b157600080fd5b600082015167ffffffffffffffff8111156101cb57600080fd5b6101d784828501610175565b91505092915050565b6000604051905081810181811067ffffffffffffffff82111715610207576102066102d5565b5b8060405250919050565b600067ffffffffffffffff82111561022c5761022b6102d5565b5b601f19601f8301169050602081019050919050565b60005b8381101561025f578082015181840152602081019050610244565b8381111561026e576000848401525b50505050565b6000600282049050600182168061028c57607f821691505b602082108114156102a05761029f6102a6565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610496806103136000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806390b98a111461003b578063f8b2cb4f1461006b575b600080fd5b610055600480360381019061005091906102a1565b61009b565b60405161006291906102fb565b60405180910390f35b61008560048036038101906100809190610278565b610206565b6040516100929190610316565b60405180910390f35b6000816000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156100ec5760009050610200565b816000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461013a9190610387565b92505081905550816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461018f9190610331565b925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516101f39190610316565b60405180910390a3600190505b92915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60008135905061025d81610432565b92915050565b60008135905061027281610449565b92915050565b60006020828403121561028a57600080fd5b60006102988482850161024e565b91505092915050565b600080604083850312156102b457600080fd5b60006102c28582860161024e565b92505060206102d385828601610263565b9150509250929050565b6102e6816103cd565b82525050565b6102f5816103f9565b82525050565b600060208201905061031060008301846102dd565b92915050565b600060208201905061032b60008301846102ec565b92915050565b600061033c826103f9565b9150610347836103f9565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561037c5761037b610403565b5b828201905092915050565b6000610392826103f9565b915061039d836103f9565b9250828210156103b0576103af610403565b5b828203905092915050565b60006103c6826103d9565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b61043b816103bb565b811461044657600080fd5b50565b610452816103f9565b811461045d57600080fd5b5056fea264697066735822122008e93b8665b79a24d44f7d952c8ca4755ba191340a2c20d9d9b382fc6a7b74c964736f6c63430008000033"

    const signer = new CfxWallet("0x2139FB4C55CB9AF7F0086CD800962C2E9013E2292BAE77978A9209E3BEE71D49", p, networkId)
    const factory = new ContractFactory(abi, bytecode, signer)
    const deploytx = factory.getDeployTransaction("ABC")
    console.log("deploy tx info:", deploytx)

    const contract = await factory.deploy("ABC")
    await contract.deployed()
    console.log("deployed contract", contract.address)

    // invoke
    console.log("\n- invoke contract")
    console.log("user token balance", await contract.getBalance(user))
    let txsend = await contract.sendCoin(tx.to, 1)
    console.log("send 1 token", await txsend.wait())
    console.log("user token balance", await contract.getBalance(user))
}

// eslint-disable-next-line no-undef
process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        // eslint-disable-next-line no-undef
        process.exit(1);
    });