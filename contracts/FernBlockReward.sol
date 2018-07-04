pragma solidity ^0.4.22;

import "./BlockReward.sol";

contract FernBlockReward is BlockReward {
  address systemAddress;

  modifier onlySystem {
    require(msg.sender == systemAddress);
    _;
  }

  constructor(address _systemAddress)
    public
  {
    /* systemAddress = 0xffffFFFfFFffffffffffffffFfFFFfffFFFfFFfE; */
    systemAddress = _systemAddress;
  }

  // produce rewards for the given benefactors, with corresponding reward codes.
  // only callable by `SYSTEM_ADDRESS`
  function reward(address[] benefactors, uint16[] kind)
    external
    onlySystem
    returns (address[], uint256[])
  {
    require(benefactors.length == kind.length);
    uint256[] memory rewards = new uint256[](benefactors.length);

    for (uint i = 0; i < rewards.length; i++) {
      rewards[i] = 1000 + kind[i];
    }

    return (benefactors, rewards);
  }
}
