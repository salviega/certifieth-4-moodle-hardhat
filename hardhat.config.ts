import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomicfoundation/hardhat-chai-matchers'
import '@openzeppelin/hardhat-upgrades'
import '@typechain/hardhat'
import 'dotenv/config'
import 'hardhat-deploy'

const { BASE_SCAN_API_KEY, BASE_SEPOLIA_RPC_URL, WALLET_PRIVATE_KEY } =
	process.env

if (!BASE_SCAN_API_KEY) {
	throw new Error('BASE_SCAN_API_KEY is not set')
}

if (!BASE_SEPOLIA_RPC_URL) {
	throw new Error('BASE_SEPOLIA_RPC_URL is not set')
}

if (!WALLET_PRIVATE_KEY) {
	throw new Error('WALLET_PRIVATE_KEY is not set')
}

const ACCOUNTS: string[] = [WALLET_PRIVATE_KEY]

const GAS: number = 30000000 // gas limit (max 30000000)
const GAS_PRICE: number = 10000000000

const SOLC_SETTINGS = {
	optimizer: {
		enabled: true,
		runs: 200
	},
	viaIR: true
}

const defaultNetwork = 'hardhat' // change the defaul network if you want to deploy onchain
const config = {
	defaultNetwork,
	networks: {
		hardhat: {
			chainId: 1337,
			allowUnlimitedContractSize: true
		},
		localhost: {
			chainId: 1337,
			allowUnlimitedContractSize: true
		},
		baseSepolia: {
			accounts: ACCOUNTS,
			chainId: 84532,
			gas: GAS,
			gasPrice: GAS_PRICE,
			url: BASE_SEPOLIA_RPC_URL
		}
	},
	etherscan: {
		apiKey: {
			baseSepolia: BASE_SCAN_API_KEY
		}
	},
	namedAccounts: {
		deployer: {
			default: 0,
			1: 0
		}
	},
	solidity: {
		compilers: [
			{
				version: '0.8.20',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.8.19',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.8.7',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.7.0',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.6.6',
				settings: SOLC_SETTINGS
			},
			{
				version: '0.4.24',
				settings: SOLC_SETTINGS
			}
		]
	},
	mocha: {
		timeout: 200000
	}
}

export default config
