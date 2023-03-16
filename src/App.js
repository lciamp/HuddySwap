import './App.css';
import { useState, useEffect} from 'react';
import { ethers } from 'ethers';
import { GearFill } from 'react-bootstrap-icons';

import PageButton from './components/PageButton';
import ConnectButton from './components/ConnectButton';
import ConfigModal from './components/ConfigModal';
import CurrencyField from './components/CurrencyField';

import { BeatLoader } from 'react-spinners';
import { getWethContract, getUniContract, getPrice, runSwap } from './AlphaRouterService';

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

  // props for currency field component
  const [inputAmount, setInputAmount] = useState(undefined)
  const [outputAmount, setOutputAmount] = useState(undefined)
  const [transaction, setTransaction] = useState(undefined)
  const [loading, setLoading] = useState(undefined)
  const [ratio, setRatio] = useState(undefined)

  // props for weth and uni 
  const [wethContract, setWethContract] = useState(undefined)
  const [uniContract, setUniContract] = useState(undefined)
  const [wethAmount, setWethAmount] = useState(undefined)
  const [uniAmount, setUniAmount] = useState(undefined)

  // function for setting the provider
  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)
      
      // get weth contract
      const wethContract = getWethContract()
      setWethContract(wethContract)

      // get uni contract
      const uniContract = getWethContract()
      setUniContract(uniContract)
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
        wethContract.balanceOf(address)
          .then(res => {
            setWethAmount(Number(ethers.utils.formatEther(res)))
          })
        uniContract.balanceOf(address)
        .then(res => {
          setUniAmount(Number(ethers.utils.formatEther(res)))
        })
      })
  }

  // get wallet address if not connected
  if (signer !== undefined){
    getWalletAddress()
  }

  const getSwapPrice = (inputAmount) => {
    setLoading(true)
    setInputAmount(inputAmount)

    const swap = getPrice(
      inputAmount,
      slippageAmount,
      // calculate deadline:
      Math.floor(Date.now()/1000 + (deadlineMinutes * 60)),
      signerAddress
    ).then(data => {
      setTransaction(data[0])
      setOutputAmount(data[1])
      setRatio(data[2])
      setLoading(false)
    })
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
