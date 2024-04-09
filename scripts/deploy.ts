import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import { SIGN_PROTOCOL_BASE_SEPOLIA_ADDRESS } from '../constants'
import verify from '../helper-functions'

import { ContractFactory } from 'ethers'
import fs from 'fs'
import { ethers } from 'hardhat'
import path from 'path'

interface Accounts {
	owner: SignerWithAddress
}

interface Contracts {
	certifiETH: any
}

let accounts: Accounts
let contracts: Contracts

async function main() {
	const signers = await ethers.getSigners()

	accounts = {
		owner: signers[0],
	}
	const { owner } = accounts

	contracts = await deployContracts()
	const { certifiETH } = contracts
}

async function deployContracts() {
	const network = await ethers.provider.getNetwork()
	let networkName = network.name

	if (networkName === 'unknown' || networkName === 'hardhat') {
		networkName = 'localhost'
	}

	const networkDir = path.join('.', 'deployments', networkName)
	if (!fs.existsSync(networkDir)) {
		fs.mkdirSync(networkDir, { recursive: true })
	}

	const [owner] = await ethers.getSigners()

	// Deploy CertifiETH contract
	const certifiETH = await deployContract('CertifiETH', [owner.address, SIGN_PROTOCOL_BASE_SEPOLIA_ADDRESS])
  const certifiAddress = await certifiETH.getAddress()
	await verify(certifiAddress, [owner.address, SIGN_PROTOCOL_BASE_SEPOLIA_ADDRESS])

	// Log deployed contracts
	console.log('\n 📜 Deployed contracts')
	console.table({
		certifiETH: certifiAddress,
	})

	const contractsDeployed = {
		certifiETH: {
			address: certifiAddress,
			abi: JSON.parse(certifiETH.interface.formatJson())
		}
	}

	const deployments = JSON.stringify(contractsDeployed, null, 2)
	fs.writeFileSync(path.join(networkDir, 'deployments.json'), deployments)

	// Return all deployed contracts
	return {
		certifiETH,
	}
}

async function deployContract(contractName: string, args: any[]) {
	const ContractFactory: ContractFactory = await ethers.getContractFactory(
		contractName
	)
	const contract = await ContractFactory.deploy(...args)
	return contract
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})