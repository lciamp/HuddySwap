import './App.css';
import { useState, useEffect} from 'react';
import { ethers } from 'ethers';
import PageButton from './components/PageButton';

function App() {

  // for interacting with the blockchain
  const [provider, setProvider] = useState(undefined)

  // set the signer so you can write to the blockchain
  const [signer, setSigner] = useState(undefined)
  
  // to check what is in the signers wallet
  const [signerAddress, setSignerAddress] = useState(undefined)

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
    provider.send("eth_RequestAccounts", [])
    const signer = provider.getSigner()
    setSigner(signer)
  }

  // check it wallet is connected
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
    <div className="App">
      <div className="appNav">
        <div className="my-2 buttonContainer buttonContainerTop">
          <PageButton name={"Swap"} isBold={true} />
          <PageButton name={"Pool"} />
          <PageButton name={"Vote"} />
          <PageButton name={"Charts"} />
        </div>
      </div>

    </div>
  );
}

export default App;
