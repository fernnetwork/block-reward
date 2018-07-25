#!/usr/bin/env node
'use strict'
const {
  MASTER_NODE_ADDRESS,
  SYSTEM_ADDRESS,
  PARITY_WS
} = require('../config.json')

const fs = require('fs')
const Web3 = require('web3')

const solc = 'docker run --rm -v $(pwd):/solidity ethereum/solc:0.4.21'

const { web3 } = require('@appliedblockchain/cobalt/web3')({
  solc: require('@appliedblockchain/cobalt/solc')({ solc }),
  provider: new Web3.providers.WebsocketProvider(PARITY_WS)
})

const from = MASTER_NODE_ADDRESS
const gas = 50000000

buildAndDeploy()
  .catch(err => console.error(err.stack || err))
  .then(() => process.exit(0))

async function buildAndDeploy() {
  web3.require('./LeafToken.sol')
  const leafToken = await web3.deploy('LeafToken', [ MASTER_NODE_ADDRESS ], { from, gas })
  console.log(`LeafToken deployed to ${leafToken.options.address}`)

  const links = {
    '__./ERC20Basic.sol:ERC20Basic___________': leafToken.options.address
  }

  web3.require('./FernBlockReward.sol')
  const fernBlockReward = await web3.deploy('FernBlockReward', [ leafToken.options.address, SYSTEM_ADDRESS ], { from, gas, links })
  console.log(`FernBlockReward deployed to ${fernBlockReward.options.address}`)

  const balance = await leafToken.methods.balanceOf(from).call()
  console.log(`System account token balance ${balance}`)

  console.log(`Transferring tokens to Block Reward contract ${fernBlockReward.options.address}.`)
  // TODO not sure why transferring directly using leafToken doesn't work - transaction gets stuck.
  web3.require('./ERC20Basic.sol')
  const token = web3.ctr.ERC20Basic
  token.options.address = leafToken.options.address
  await token.methods.transfer(fernBlockReward.options.address, 1000000).send({ from, gas })

  outputContractAbi()
  console.log('Deployment complete.')
}

function outputContractAbi() {
  for (const [ name, ctr ] of Object.entries(web3.ctr)) {
    const outPath = `abis/${name}.json`
    fs.writeFileSync(outPath, JSON.stringify(ctr.options.jsonInterface, null, 2))
  }
}
