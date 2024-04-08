import { upgrades } from 'hardhat'

export async function getImplementationAddress(
	proxyAddress: string
): Promise<string> {
	const implementationAddress = await upgrades.erc1967.getImplementationAddress(
		proxyAddress
	)

	return implementationAddress
}

export async function getProxyAdmin(proxyAddress: string): Promise<string> {
	const proxyAdmin = await upgrades.erc1967.getAdminAddress(proxyAddress)

	return proxyAdmin
}
