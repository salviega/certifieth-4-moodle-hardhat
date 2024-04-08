interface networkConfigItem {
	ethUsdPriceFeed?: string
	blockConfirmations?: number
}

interface networkConfigInfo {
	[key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
	hardhat: {},
	localhost: {
		blockConfirmations: 3
	},
	bsctestnet: {
		blockConfirmations: 3
	},
	mumbai: {
		blockConfirmations: 3
	}
}

export const developmentChains: string[] = ['hardhat', 'localhost']
