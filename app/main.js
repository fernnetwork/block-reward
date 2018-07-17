'use strict'
/** Block reward test app - monitors miner token increase. **/

const leafToken = require('../abis/LeafToken.json')
const Web3 = require('web3')
const web3 = new Web3('ws://localhost:8546')
const tokenContract = new web3.eth.Contract(leafToken, '0x146f8035F59d973d23e9dF38e7e4A9D60182e551')

web3.eth.subscribe('newBlockHeaders', async (error, blockHeader) => {
  const balance = await tokenContract.methods.balanceOf(blockHeader.miner).call()
  console.log(`New blocked mined. ${blockHeader.miner} now has ${balance} tokens.`)
})

// create transactions
const send = (previous) => setTimeout(async () => {
  await previous
  const next = web3.eth.sendTransaction({
    from: '0x00Ea169ce7e0992960D3BdE6F5D539C955316432',
    to: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
    value: '1',
    gas: 500000
  })
  send(next)
}, 5000)

send(Promise.resolve())
