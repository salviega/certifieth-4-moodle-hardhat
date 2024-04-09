// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {Attestation} from '@ethsign/sign-protocol-evm/src/models/Attestation.sol';

interface SPMock {
	function attest(
		Attestation calldata attestation,
		string calldata indexingKey,
		bytes calldata delegateSignature,
		bytes calldata extraData
	) external returns (uint64);
}
