#!/usr/bin/env node
'use strict'
const {
  SYSTEM_ADDRESS,
  PARITY_WS
} = require('../config.json')

const fs = require('fs')
const Web3 = require('web3')

const solc = 'docker run --rm -v $(pwd):/solidity ethereum/solc:0.4.22'

const { web3 } = require('@appliedblockchain/cobalt/web3')({
  solc: require('@appliedblockchain/cobalt/solc')({ solc }),
  provider: new Web3.providers.WebsocketProvider(PARITY_WS)
})

const contractsToDeploy = [ 'FernBlockReward' ]
const from = SYSTEM_ADDRESS
const gas = 50000000

buildAndDeploy()
  .catch(err => console.error(err.stack || err))
  .then(() => process.exit(0))

async function buildAndDeploy() {
  const deployments = contractsToDeploy.map(name => {
    web3.require(`./${name}.sol`)
    return web3.deploy(name, [ SYSTEM_ADDRESS ], { from, gas })
      .then(contract => {
        console.log(`${name} contract deployed successfully to ${contract.options.address}`)
      })
  })

  await Promise.all(deployments)
  outputContractAbi()
}

function outputContractAbi() {
  for (const [ name, ctr ] of Object.entries(web3.ctr)) {
    const outPath = `abis/${name}.json`
    fs.writeFileSync(outPath, JSON.stringify(ctr.options.jsonInterface, null, 2))
  }
}
