require('chai')
  .use(require("chai-as-promised"))
  .should();

const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor, ...others]) => {
  let daiToken, dappToken, tokenFarm;
  before(async () => {
    // Load contracts
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // Repeat steps from migration 2
    await dappToken.transfer(tokenFarm.address, tokens('1000000'));
    await daiToken.transfer(investor, tokens('100'), { from: owner });
  });

  describe("DAI token deployment", async () => {
    it("has a name", async () => {
      assert.equal(await daiToken.name(), "Mock DAI Token");
    });
  });

  describe("Dapp token deployment", async () => {
    it("has a name", async () => {
      assert.equal(await dappToken.name(), "DApp Token");
    });
  });

  describe("Token Farm", async () => {
    it("has a name", async () => {
      assert.equal(await tokenFarm.name(), "Dapp Token Farm");
    });

    it("has tokens", async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });

    it("rewards investors for staking", async () => {
      let beforeStaking = await daiToken.balanceOf(investor);
      assert.equal(beforeStaking.toString(), tokens('100'));

      // Staking tokens
      // Approval is necessary for letting tokenFarm transfer in place of investor
      await daiToken.approve(tokenFarm.address, tokens("100"), { from: investor });
      await tokenFarm.stakeTokens(tokens("100"), { from: investor });

      let invBal = await daiToken.balanceOf(investor);
      assert.equal(invBal.toString(), tokens('0'), 'inv bal');
      let farmBal = await daiToken.balanceOf(tokenFarm.address);
      let farmBalM = await tokenFarm.stakingBalance(investor);
      assert.equal(farmBal.toString(), tokens('100'), 'farm bal');
      assert.equal(farmBalM.toString(), tokens('100'), 'farm bal 2');
      assert.equal(
        (await tokenFarm.isStaking(investor)).toString(),
        'true'
      );

      // Issuing tokens
      await tokenFarm.issueTokens({ from: owner });

      invBal = await dappToken.balanceOf(investor);
      assert.equal(invBal.toString(), tokens('100'), '100 dapp balance after issuing');

      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // Unstaking tokens
      await tokenFarm.unstakeTokens({ from: investor });
      invBal = await daiToken.balanceOf(investor);
      assert.equal(invBal.toString(), tokens('100'), "investor dai balance has to be 100" +
        " after unstaking");
      farmBal = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(farmBal.toString(), tokens('0'), "farm dai balance has to be 0" +
        " after unstaking");
      assert.equal(tokenFarm.stakers.length, 0);
    });
  });
});

