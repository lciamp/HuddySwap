import './App.css';
import { useState, useEffect} from 'react';
import { ethers } from 'ethers';

function App() {

  /// for interacting with the blockchain
  const [provider, setProvider] = useState(undefined)

  /// set the signer so you can write to the blockchain
  const [signer, setSigner] = useState(undefined)
  
  /// to check what is in the signers wallet
  const [signerAddress, setSigner] = useState(undefined)

  /// function for setting the provider
  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)
    }
    onLoad()
  }, [])




  return (
    <div className="App">

    </div>
  );
}

export default App;
