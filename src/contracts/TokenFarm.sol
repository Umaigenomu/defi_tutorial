pragma solidity ^0.5.16;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DaiToken public daiToken;  // state variables
    DappToken public dappToken;

    constructor(DaiToken _daiT, DappToken _dappT) public {
        daiToken = _daiT;
        dappToken = _dappT;
    }
}
