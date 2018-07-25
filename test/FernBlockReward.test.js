'use strict'

const { web3, accounts } = require('@appliedblockchain/cobalt/web3')({
  accounts: 10,
  logger: console
})

const addresses = accounts.map(account => account.address)
const SYSTEM = addresses[9]
const gas = 50000000

describe('FernBlockReward', () => {
  let blockReward, leafToken

  beforeAll(async () => {
    web3.require('./LeafToken.sol')
    leafToken = await web3.deploy('LeafToken', [ SYSTEM ], { from: SYSTEM, gas })

    web3.require('./FernBlockReward.sol')
    const links = {
      '__./ERC20Basic.sol:ERC20Basic___________': leafToken.options.address
    }
    blockReward = await web3.deploy('FernBlockReward', [ leafToken.options.address, SYSTEM ], { from: SYSTEM, gas, links })

    // deposit token into block reward contract
    leafToken.methods.transfer(blockReward.options.address, 100000).send({ from: SYSTEM })
  })

  afterAll(async () => {
    web3.close()
  })

  it('should transfer rewards to benefactor', async () => {
    const benefactors = [
      addresses[0]
    ]
    const kind = [ 0 ]

    let balance = await leafToken.methods.balanceOf(addresses[0]).call()
    expect(balance).toEqual('0')

    await blockReward.methods.reward(benefactors, kind).send({ from: SYSTEM, gas: 500000 })

    balance = await leafToken.methods.balanceOf(addresses[0]).call()
    expect(balance).toEqual('1')
  })

  it('should reject calls not coming from system', async () => {
    const benefactors = [
      addresses[0],
      addresses[1],
      addresses[2],
      addresses[3]
    ]

    const kind = [ 0, 1, 2, 3 ]

    const receipt = blockReward.methods.reward(benefactors, kind).send({ from: addresses[1] })
    expect(receipt).rejects.toThrow('revert')
  })

  it('should validate benefactors and kinds have same size', async () => {
    const benefactors = [
      addresses[0],
      addresses[1],
      addresses[2],
      addresses[3]
    ]

    const kind = [ 0, 1, 2, 3 ]

    const receipt = blockReward.methods.reward(benefactors, kind).send({ from: SYSTEM })
    expect(receipt).rejects.toThrow('revert')
  })
})
