type Network = "development" | "kovan" | "mainnet";

module.exports = (artifacts: Truffle.Artifacts, web3: Web3) => {
  const DappToken = artifacts.require("DappToken");
  const DaiToken = artifacts.require("DaiToken");
  const TokenFarm = artifacts.require("TokenFarm");

  return async (
    deployer: Truffle.Deployer,
    network: Network,
    accounts: Truffle.Accounts
  ) => {
    // User stakes DAI on the farm, receives Dapp as interest

    // 1. Deploy DAI token
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();

    // 2. Deploy Dapp token
    await deployer.deploy(DappToken);
    const dappToken = await DappToken.deployed();

    // 3. Deploy TokenFarm
    await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);  // constructor args
    const tokenFarm = await TokenFarm.deployed();

    // 4. Transfer all Dapp tokens to TokenFarm (1 million)
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

    // 5. Transfer 100 DAI tokens to investor account (2nd account in the list)
    await daiToken.transfer(accounts[1], '100000000000000000000');
  };
}
