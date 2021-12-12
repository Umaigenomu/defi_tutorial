pragma solidity ^0.5.16;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    address public owner;
    DaiToken public daiToken;  // state variables
    DappToken public dappToken;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappT, DaiToken _daiT) public {
        daiToken = _daiT;
        dappToken = _dappT;
        owner = msg.sender;
    }

    // Staking tokens (deposit)
    function stakeTokens(uint _amount) public {
        require(_amount > 0, "amount cannot be 0");
        // Transfer DAI tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);
        // Update staking balance and add investor to array of stakers if not there yet
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        stakingBalance[msg.sender] += _amount;
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    // Unstaking tokens (withdraw)
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, "staking balance cannot be 0");

        // Transfer DAI tokens back to investor
        daiToken.transfer(msg.sender, balance);
        // Update staking balance and other meta data
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
        uint invI;
        for (uint i=0; i < stakers.length; i++) {
            address r = stakers[i];
            if (r == msg.sender) {
                invI = i;
            }
        }
        delete stakers[invI];
    }

    // Issuing tokens
    function issueTokens() public {
        require(msg.sender == owner, "caller must be the owner");

        for (uint i=0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint amntStaking = stakingBalance[recipient];
            if (amntStaking > 0 ) {
                dappToken.transfer(recipient, amntStaking);
            }
        }
    }
}
