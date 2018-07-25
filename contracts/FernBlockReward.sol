pragma solidity ^0.4.21;

import "./BlockReward.sol";
import "./SafeERC20.sol";

contract FernBlockReward is BlockReward {
  using SafeERC20 for ERC20Basic;

  address systemAddress;
  ERC20Basic token;

  modifier onlySystem {
    require(msg.sender == systemAddress);
    _;
  }

  function FernBlockReward(ERC20Basic _token, address _systemAddress)
    public
  {
    // systemAddress = 0xffffFFFfFFffffffffffffffFfFFFfffFFFfFFfE;
    systemAddress = _systemAddress;
    token = _token;
  }

  // produce rewards for the given benefactors, with corresponding reward codes.
  // only callable by `SYSTEM_ADDRESS`
  function reward(address[] benefactors, uint16[] kind)
    external
    onlySystem
    returns (address[], uint256[])
  {
    require(benefactors.length == kind.length);

    uint256 amount = token.balanceOf(this);
    require(amount > 1);

    // transfer reward token
    token.safeTransfer(benefactors[0], 1);

    // no ethers rewards
    return (benefactors, new uint256[](benefactors.length));
  }
}
