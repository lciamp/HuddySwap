import './App.css';
import { useState, useEffect} from 'react';
import { ethers } from 'ethers';
import { GearFill } from 'react-bootstrap-icons';

import PageButton from './components/PageButton';
import ConnectButton from './components/ConnectButton';
import ConfigModal from './components/ConfigModal';
import { BeatLoader } from 'react-spinners';

function App() {

  // for interacting with the blockchain
  const [provider, setProvider] = useState(undefined)

  // set the signer so you can write to the blockchain
  const [signer, setSigner] = useState(undefined)
  
  // to check what is in the signers wallet
  const [signerAddress, setSignerAddress] = useState(undefined)

  // set slippage amount and deadline minutes for swap
  const [slippageAmount, setSlippageAmount] = useState(2)
  const [deadlineMinutes, setDeadlineMinutes] = useState(10)

  const [showModal, setShowModal] = useState(undefined)

  // function for setting the provider
  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)
    }
    onLoad()
  }, [])

  // functions for connecting to the wallet
  const getSigner = async provider => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer)
  }

  // check if wallet is connected
  const isConnected = () => signer !== undefined 

  // get the wallet address
  const getWalletAddress = () => {
    signer.getAddress()
      .then(address => {
        setSignerAddress(address)

        // todo: connect weth with uni contracts
      } )
  }

  if (signer !== undefined){
    getWalletAddress()
  }

  return (
    // main buttons, on swap is gonna work, it for looks.
    <div className="App">
      <div className="appNav">
        <div className="my-2 buttonContainer buttonContainerTop">
          <PageButton name={"Swap"} isBold={true} />
          <PageButton name={"Pool"} />
          <PageButton name={"Vote"} />
          <PageButton name={"Charts"} />
        </div>
        {/* connect button */}
        <div className="rightNav">
          <div className="connectButtonContainer">
            <ConnectButton
              provider={provider}
              isConnected={isConnected}
              signerAddress={signerAddress}
              getSigner={getSigner}
            />
          </div>
          <div className="my-2 buttonContainer">
            <PageButton name={"..."} isBold={true} />
          </div>
        </div>
      </div>
      {/* the swap container */}
      <div className="appBody">
        <div className="swapContainer">
          <div className="swapHeader">
            <span className="swapText">huddyswap</span>
            <span className="gearContainer" onClick={() => setShowModal(true)}>
              <GearFill />
            </span>
            {showModal && (
              <ConfigModal 
                onClose={() => setShowModal(false)}
                setDeadlineMinutes={setDeadlineMinutes}
                deadlineMinutes={deadlineMinutes}
                setSlippageAmount={setSlippageAmount}
                slippageAmount={slippageAmount}/>
            )}
          </div>

          <div className="swapBody">
            <CurrencyField 
              field="input"
              tokenName="WETH"
              getSwapPrice={getSwapPrice}
              signer={signer}
              balance={wethAmount} />
            <CurrencyField 
              field="output"
              tokenName="UNI"
              value={outputAmount}
              signer={signer}
              balance={wethAmount} 
              spinner={BeatLoader}
              loading={loading} />

          </div>



        </div>
      </div>
    </div>
  );
}

export default App;
