import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ContractFactory } from 'ethers'
import { ethers } from 'hardhat'

interface Accounts {
	owner: SignerWithAddress
	alice: SignerWithAddress
	bob: SignerWithAddress
	kyle: SignerWithAddress
	carol: SignerWithAddress
}

interface Contracts {
	spTest: any
	certifiETH: any
}

describe('CertifiETH Flow', async function () {
	function toDecimal(value: number): bigint {
		return BigInt(value * 10 ** 18)
	}

	function toNumber(value: bigint): number {
		return Number(value / BigInt(10 ** 18))
	}

	const course1: string = 'Course 1'

	const signatureMessage: string = 'This is a test message'
	const hash: string = ethers.hashMessage(signatureMessage)

	const uri: string = 'https://ipfs.io/ipfs/QmZ'

	let accounts: Accounts
	let contracts: Contracts

	beforeEach(async function () {
		const signers = await ethers.getSigners()
		accounts = {
			owner: signers[0],
			alice: signers[1],
			bob: signers[2],
			kyle: signers[3],
			carol: signers[4]
		}

		contracts = await deployContracts()
		const { certifiETH } = contracts

		const setCategorySchemaIdTx = await certifiETH
			.connect(accounts.owner)
			.setCategorySchemaId(1)
		await setCategorySchemaIdTx.wait()

		const setCategoryLinkedAttestationIdTx = await certifiETH
			.connect(accounts.owner)
			.setCategoryLinkedAttestationId(1)
		await setCategoryLinkedAttestationIdTx.wait()

		const setCourseSchemaIdTx = await certifiETH
			.connect(accounts.owner)
			.setCourseSchemaId(course1, 1)
		await setCourseSchemaIdTx.wait()
	})

	it('Happy workflow', async () => {
		// Arrange
		const { owner, alice, bob, kyle } = accounts
		const { certifiETH } = contracts

		const signature: string = await alice.signMessage(signatureMessage)

		// Act
		console.log(' 🚩  1. Attest student')
		const attestCourseTx = await certifiETH
			.connect(owner)
			.attestCourse(alice.address, hash, signature, course1)
		attestCourseTx.wait()

		const transactionReceipt = await ethers.provider.getTransactionReceipt(
			attestCourseTx.hash
		)
		const transactionBlockNumber = transactionReceipt.blockNumber

		const events = await certifiETH.queryFilter(
			'Attested',
			transactionBlockNumber
		)

		const event = events[events.length - 1]

		const aliceAttestationIdEmited = event.args.attestationId

		const aliceAttestationIdStored = await certifiETH.attestationIds(
			course1,
			alice.address
		)

		// assert
		expect(aliceAttestationIdStored.toString()).to.equal(
			aliceAttestationIdEmited.toString()
		)

		// Act
		console.log(' 🚩  2. Mint student NFT')
		const safeMintTx = await certifiETH
			.connect(owner)
			.safeMint(alice.address, hash, signature, course1, uri)
		safeMintTx.wait()
	})
})

async function deployContracts() {
	const [owner] = await ethers.getSigners()

	// Deploy SPMock contract
	const spTest = await deployContract('SPTest', [])
	const spTestAddress: string = await spTest.getAddress()

	// Deploy CertifiETH contract
	const certifiETH = await deployContract('CertifiETH', [
		owner.address,
		spTestAddress
	])
	const certifiAddress = await certifiETH.getAddress()

	// Log deployed contracts
	console.log('\n 📜 Deployed contracts')
	console.table({
		spTest: spTestAddress,
		certifiETH: certifiAddress
	})

	// Return all deployed contracts
	return {
		spTest,
		certifiETH
	}
}

async function deployContract(contractName: string, args: any[]) {
	const ContractFactory: ContractFactory =
		await ethers.getContractFactory(contractName)

	const contract = await ContractFactory.deploy(...args)
	return contract
}
