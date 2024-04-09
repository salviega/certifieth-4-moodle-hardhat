// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {Attestation} from '@ethsign/sign-protocol-evm/src/models/Attestation.sol';

contract SPTest {
	uint256 public counterAttestationId;

	function attest(
		Attestation calldata attestation,
		string calldata indexingKey,
		bytes calldata delegateSignature,
		bytes calldata extraData
	) external returns (uint64) {
		counterAttestationId++;
		uint64 attestationId = uint64(counterAttestationId);

		return attestationId;
	}
}
