const TokenFarm = artifacts.require("TokenFarm");

module.exports = async (callback) => {
  let tokenFarm = await TokenFarm.deployed();
  await tokenFarm.issueTokens();

  console.log("Tokens issued.")
  console.log(`Stakers: ${await tokenFarm.stakers(0)}`);
  callback();
};
