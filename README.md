# Block Reward

Parity has built-in support for block rewards (for AuRa consensus engine only)

https://wiki.parity.io/Block-Reward-Contract

```
interface BlockReward {
    // produce rewards for the given benefactors,
    // with corresponding reward codes.
    // only callable by `SYSTEM_ADDRESS`
    function reward(address[] benefactors, uint16[] kind)
        external
        returns (address[] benefactors, uint256[] rewards);
}
```

This repository contains an implementation of the above interface and has been tested in a private PoA network. 

Once the contract address is added to spec.json, Parity node will invoke this contract using the system address 0xffffFFFfFFffffffffffffffFfFFFfffFFFfFFfE before closing each block.

By default, the rewards are transferred to benefactors in ethers. However, it is also possible to do ERC-20 token transfer in this contract.

For example, given this parity system call:
```
reward(['0x5d8b81D0FE11046bb0Dc31507706A08C0E1d5e85'], [0]
```
When the contract reward function returns
```
['0x5d8b81D0FE11046bb0Dc31507706A08C0E1d5e85'], [1000]
```
Then 1000 worth of ethers is transferred to the address 0x5d8b81D0FE11046bb0Dc31507706A08C0E1d5e85

## Deploying using the genesis state
If you deployed by using the genesis state in the chain spec then you must concatenate the encoded arguments (i.e. system address) to the contract bytecode.

For example:

Given contract byte code:  0x1234....5678

And I want to pass the address 0xffffFFFfFFffffffffffffffFfFFFfffFFFfFFfE as constructor argument. Encode the address using ethabi:
```
$ ethabi encode params -v address ffffFFFfFFffffffffffffffFfFFFfffFFFfFFfE
// prints "000000000000000000000000fffffffffffffffffffffffffffffffffffffffe"
```

Then add this to spec json.
```
"accounts": {
  ...
  "0000000000000000000000000000000000000042": {
    "balance": "1",
    "constructor": "[contract_bytecode]000000000000000000000000fffffffffffffffffffffffffffffffffffffffe"
  }
}
```
