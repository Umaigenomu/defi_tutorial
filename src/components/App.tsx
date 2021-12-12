import React from 'react'
import Navbar from './Navbar'
import './App.css'
import Web3 from "web3";
import DaiToken from "../abis/DaiToken.json";
import DappToken from "../abis/DappToken.json";
import FarmToken from "../abis/TokenFarm.json";
import dai from "../dai.png";
import { provider } from "web3-core";

declare global {
  interface Window {
    ethereum: provider;
    web3: Web3;
  }
}

function App() {
  let lInput = React.useRef<any>();
  const [localState, setLocalState] = React.useState<any>({
    account: '0x0',
    daiToken: {},
    dappToken: {},
    tokenFarm: {},
    daiTokenBalance: '0',
    dappTokenBalance: '0',
    stakingBalance: '0',
    loading: true
  });

  React.useEffect(() => {
    // Load Web3
    (async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await (window.ethereum as any).enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
      }
    })();

    // Load blockchain data;
    try {
      (async () => {
        let newLocalState = localState;
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        newLocalState = { ...newLocalState, account: accounts[0] };

        const networkId = await web3.eth.net.getId();
        // Load DAI token
        const daiTokenData = DaiToken.networks[networkId as never] as any;
        if (daiTokenData) {
          const daiToken = new web3.eth.Contract(DaiToken.abi as any, daiTokenData.address);
          newLocalState = { ...newLocalState, daiToken };
          let daiTokenBalance = await daiToken.methods.balanceOf(newLocalState.account).call();
          newLocalState = { ...newLocalState, daiTokenBalance: daiTokenBalance.toString() };
        } else {
          window.alert("DAI token contract not deployed to detected network.");
        }

        // Load Dapp token
        const dappTokenData = DappToken.networks[networkId as never] as any;
        if (dappTokenData) {
          const dappToken = new web3.eth.Contract(DappToken.abi as any, dappTokenData.address);
          newLocalState = { ...newLocalState, dappToken };
          let dappTokenBalance = await dappToken.methods.balanceOf(newLocalState.account).call();
          newLocalState = { ...newLocalState, dappTokenBalance: dappTokenBalance.toString() };
        } else {
          window.alert("DAPP token contract not deployed to detected network.");
        }

        // Load Farm token
        const farmTokenData = FarmToken.networks[networkId as never] as any;
        if (farmTokenData) {
          const farmToken = new web3.eth.Contract(FarmToken.abi as any, farmTokenData.address);
          newLocalState = { ...newLocalState, tokenFarm: farmToken };
          let stakingBalance = await farmToken.methods.stakingBalance(newLocalState.account).call();
          newLocalState = { ...newLocalState, stakingBalance: stakingBalance.toString() };
        } else {
          window.alert("Farm token contract not deployed to detected network.");
        }

        setLocalState({ ...newLocalState, loading: false });
      })();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const stakeTokens = (amount: any) => {
    setLocalState({ ...localState, loading: true });
    localState
      .daiToken.methods
      .approve(localState.tokenFarm._address, amount)
      .send({ from: localState.account })
      .on('transactionHash', (hash: any) => {
        localState
          .tokenFarm.methods
          .stakeTokens(amount)
          .send({ from: localState.account })
          .on('transactionHash', (hash: any) => {
            setLocalState({ ...localState, loading: false });
          });
      });
  }

  const unstakeTokens = () => {
    setLocalState({ ...localState, loading: true });
    localState
      .tokenFarm.methods
      .unstakeTokens()
      .send({ from: localState.account })
      .on("transactionHash", (hash: any) => {
        setLocalState({ ...localState, loading: false });
      });
  };

  return (
    <div>
      <Navbar account={localState.account}/>
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto"
                style={{ maxWidth: '600px' }}>
            <div className="content mr-auto ml-auto">
              <a
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
              >
              </a>
              {localState.loading ? (
                <p>loading...</p>
              ) : (
                <div id="content" className="mt-3">
                  <table className="table table-borderless text-muted text-center">
                    <thead>
                      <tr>
                        <th scope="col">Staking Balance</th>
                        <th scope="col">Reward Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {window.web3.utils.fromWei(localState.stakingBalance, "ether")} mDAI
                        </td>
                        <td>
                          {window.web3.utils.fromWei(localState.dappTokenBalance, "ether")} Dapp
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="card mb-4">
                    <div className="card-body">
                      <form className="mb-3" onSubmit={(event) => {
                        event.preventDefault();
                        let amount;
                        amount = lInput.current.value.toString();
                        amount = window.web3.utils.toWei(amount, 'ether');
                        stakeTokens(amount);
                      }}>
                        <div>
                          <label className="float-left"><b>Stake Tokens</b></label>
                          <span className="float-right text-muted">
                            Balance: {window.web3.utils.fromWei(localState.daiTokenBalance, 'ether')}
                          </span>
                        </div>
                        <div className="input-group mb-4">
                          <input
                            type="text"
                            ref={(input) => {
                              lInput.current = input;
                            }}
                            className="form-control form-control-lg"
                            placeholder="0"
                            required
                          />
                          <div className="input-group-append">
                            <div className="input-group-text">
                              <img src={dai} height="32" alt=""/>
                              &nbsp;&nbsp;&nbsp; mDAI
                            </div>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary btn-block btn-lg"
                        >
                          STAKE!
                        </button>
                      </form>
                      <button
                        type="submit"
                        className="btn btn-link btn-block btn-sm"
                        onClick={(event) => {
                          event.preventDefault();
                          unstakeTokens();
                        }}
                      >
                        UN-STAKE...
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
