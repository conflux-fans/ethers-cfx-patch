# Ethers Cfx Patch 

## Description

`ethers-cfx-patch` is used for compatiable ethers with conflux network. The purpose is to overwrite some methods to compatibale with cfx network, most are functions related address and transaction. And it will not break origin features.

## Install
```sh
$ npm install ethers-cfx-patch
```
## Usage

### Overwrite methods
Load ethers-cfx-patch package in the head of your project. It will overwrite methods.
```js
// load pacakge to overwrite methods
require("ethers-cfx-patch")
// your project
// ...
```

### Use CFX proxy provider
We provide an [`JsonRpcProxy`](https://github.com/conflux-fans/web3-provider-proxy) for adapter ethereum rpc to conflux rpc, use `JsonRpcProxy` to create an Web3Provider
```js
const JsonRpcProxy = require("web3-provider-proxy");

const cfxProxy = new JsonRpcProxy("http://localhost:12537")
const povider = new ethers.providers.Web3Provider(cfxProxy)
```

### CfxWallet
The CfxWallet is used for sign, sendTransaction, deploy contract in cfx format. It need one more param `networkId` which could access by `provider.getNetowrk` to create an instance.

```js
let network = await provider.getNetwork()
let networkId = network.chainId
let signer = new CfxWallet("0x2139FB4C55CB9AF7F0086CD800962C2E9013E2292BAE77978A9209E3BEE71D49",p, networkId)
console.log("signer address", await signer.address)
console.log("sign message:", await signer.signMessage("hello"))
const txSended = await signer.sendTransaction({ ...tx, from: signer.address })
const receipt = await txSended.wait(1)
console.log("send tx by wallet", { txSended, receipt })
```

### utils
There also provids some [utils methods](https://github.com/conflux-fans/ethers-cfx-patch/blob/main/utils.js) used for conflux network