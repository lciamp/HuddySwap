const  { AlphaRouter } = require('@uniswap/smart-order-router')
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const JSBI = require('jsbi')
const ERC20ABI = require('./abi.json')

// swap router wallet address
const V3_SWAP_ROUTER_ADDRESS = '0xe592427a0aece92de3edee1f18e0157c05861564'

// don't need to explicitly use env lib, just add REACT_APP_
const REACT_APP_INFURA_URL_TESTNET = process.env.REACT_APP_INFURA_URL_TESTNET

// set chain id for Ethereum's Ropsten Testnet
// todo: switch to Kiln or Goerli network - DONE (Goerli = 5)
const chainId = 5

// create provider to talk with infura
const web3Provider = new ethers.providers.JsonRpcProvider(REACT_APP_INFURA_URL_TESTNET)

// router setup
const router = new AlphaRouter({ chainId: chainId, web3Provider: web3Provider})

// vars for weth
const name0     = 'Wrapped Ether'
const symbol0   = 'WETH'
const decimals0 = 18
// account 1 in metamask
const address0  = '0x958022786C530a428be5407E05345A8675CAfCB6'

// vars for uni
const name1     = 'Uniswap Token'
const symbol1   = 'UNI'
const decimals1 = 18
// account 2 in metamask
const address1  = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'

// make some tokens
const WETH = new Token(chainId, address0, decimals0, symbol0, name0)
const UNI  = new Token(chainId, address1, decimals1, symbol1, name1)

// get contracts
export const getWethContract = () => new ethers.Contract(address0, ERC20ABI, web3Provider)
export const getUniContract = () => new ethers.Contract(address1, ERC20ABI, web3Provider)

// todo: fix uni connection
// get current UNI price
export const getPrice = async (inputAmount, slippageAmount, deadline, walletAddress) => {
    const percentSlippage = new Percent(slippageAmount, 100)
    const wei = ethers.utils.parseUnits(inputAmount.toString(), decimals0)
    const currencyAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei))

    const route = await router.route(
        currencyAmount,
        UNI,
        TradeType.EXACT_INPUT,
        {
            recipient: walletAddress,
            slippageTolerance: percentSlippage,
            deadline: deadline,
        }
    )

    // build a transaction
    const transaction = {
        data: route.methodParameters.calldata,
        to: V3_SWAP_ROUTER_ADDRESS,
        value: BigNumber.from(route.methodParameters.value),
        from: walletAddress,
        gasPrice: BigNumber.from(route.gasPriceWei),
        gasLimit: ethers.utils.hexlify(1000000)
    }

    const quoteAmountOut = route.quote.toFixed(6)
    const ratio = (inputAmount / quoteAmountOut).toFixed(3)

    return [
        transaction,
        quoteAmountOut,
        ratio
    ]
}

// function for the swap
export const runSwap = async (transaction, signer) => {
    // allow uni to access tokens in your wallet
    const approvalAmount = ethers.utils.parseUnits('10', 18).toString()
    const contract0 = getWethContract()

    // think of signer as wallet
    await contract0.connect(signer).approve(
        V3_SWAP_ROUTER_ADDRESS,
        approvalAmount
    )

    // send off for the swap
    signer.sendTransaction(transaction)
}