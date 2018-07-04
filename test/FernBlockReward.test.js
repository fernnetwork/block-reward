'use strict'

const { web3, accounts } = require('@appliedblockchain/cobalt/web3')({
  accounts: 10,
  logger: console
})

const addresses = accounts.map(account => account.address)
const SYSTEM = addresses[9]
const gas = 50000000

describe('FernBlockReward', () => {
  let blockReward

  beforeAll(async () => {
    web3.require('./FernBlockReward.sol')
    blockReward = await web3.deploy('FernBlockReward', [ SYSTEM ], { from: SYSTEM, gas })
  })

  afterAll(async () => {
    web3.close()
  })

  it('should calculate rewards', async () => {
    const benefactors = [
      addresses[0],
      addresses[1],
      addresses[2],
      addresses[3]
    ]

    const kind = [ 0, 1, 2, 3 ]

    // we do a local call so we can get back the return value
    const rewards = await blockReward.methods.reward(benefactors, kind).call(({ from: SYSTEM }))
    await blockReward.methods.reward(benefactors, kind).send({ from: SYSTEM })

    const expectedRewards = [ 1000, 1001, 1002, 1003 ]

    expect(rewards[0]).toEqual(benefactors)
    expect(rewards[1].map(v => Number(v))).toEqual(expectedRewards)
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
