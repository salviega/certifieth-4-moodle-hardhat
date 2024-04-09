// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {ISP} from '@ethsign/sign-protocol-evm/src/interfaces/ISP.sol';
import {Attestation} from '@ethsign/sign-protocol-evm/src/models/Attestation.sol';
import {DataLocation} from '@ethsign/sign-protocol-evm/src/models/DataLocation.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
using ECDSA for bytes32;

contract CertifiETH is
	ERC721,
	ERC721Enumerable,
	ERC721URIStorage,
	ERC721Burnable,
	Ownable
{
	ISP public spInstance;
	uint64 public categoryLinkedAttestationId;
	uint64 public categorySchemaId;
	uint256 public tokenCounterId;

	mapping(string course => uint64 schemaId) public courseSchemaIds;
	mapping(string course => mapping(address student => uint64 attestationId))
		public attestationIds;

	event Attested(address indexed to, uint64 indexed attestationId);

	modifier verifySignature(
		address _signer,
		bytes32 _hash,
		bytes memory _signature
	) {
		bool isSigner = _hash.recover(_signature) == _signer;
		require(isSigner, 'verifySignature: Invalid signature');
		_;
	}

	constructor(
		address _initialOwner,
		address _spInstance
	) ERC721('CertifiETH', 'CETH') Ownable(_initialOwner) {
		spInstance = ISP(_spInstance);
	}

	// ************************ //
	// *      CertifiETH      * //
	// ************************ //

	function attestCourse(
		address _to,
		bytes32 _hash,
		bytes calldata _signature,
		string calldata _course
	)
		external
		onlyOwner
		verifySignature(_to, _hash, _signature)
		returns (uint64)
	{
		require(courseSchemaIds[_course] != 0, 'safeMint: course schema not found');
		require(
			attestationIds[_course][_to] == 0,
			'safeMint: student already has an attestation'
		);

		uint64 courseSchemaId = courseSchemaIds[_course];

		bytes[] memory students = new bytes[](1);
		students[0] = abi.encode(_to);

		Attestation memory attestation = Attestation({
			schemaId: courseSchemaId,
			linkedAttestationId: categoryLinkedAttestationId,
			attestTimestamp: 0,
			revokeTimestamp: 0,
			attester: address(this),
			validUntil: 0,
			dataLocation: DataLocation.ONCHAIN,
			revoked: false,
			recipients: students,
			data: bytes('')
		});

		uint64 attestationId = spInstance.attest(
			attestation,
			'',
			bytes(''),
			bytes('')
		);

		attestationIds[_course][_to] = attestationId;

		emit Attested(_to, attestationId);
		return attestationId;
	}

	function safeMint(
		address _to,
		bytes32 _hash,
		bytes memory _signature,
		string calldata _course,
		string calldata _uri
	) public onlyOwner verifySignature(_to, _hash, _signature) returns (uint256) {
		require(
			attestationIds[_course][_to] != 0,
			'safeMint: student does not have an attestation'
		);

		uint256 tokenId = tokenCounterId++;
		_safeMint(_to, tokenId);
		_setTokenURI(tokenId, _uri);

		return tokenId;
	}

	// ************************ //
	// *  Getters y Setters   * //
	// ************************ //

	function setCategoryLinkedAttestationId(
		uint64 _categoryLinkedAttestationId
	) external onlyOwner {
		categoryLinkedAttestationId = _categoryLinkedAttestationId;
	}

	function setCategorySchemaId(uint64 _categorySchemaId) external onlyOwner {
		categorySchemaId = _categorySchemaId;
	}

	function setCourseSchemaId(
		string calldata _course,
		uint64 _schemaId
	) external onlyOwner {
		courseSchemaIds[_course] = _schemaId;
	}

	function setSPInstance(address _spInstance) external onlyOwner {
		spInstance = ISP(_spInstance);
	}

	// The following functions are overrides required by Solidity.

	function _update(
		address to,
		uint256 tokenId,
		address auth
	) internal override(ERC721, ERC721Enumerable) returns (address) {
		return super._update(to, tokenId, auth);
	}

	function _increaseBalance(
		address account,
		uint128 value
	) internal override(ERC721, ERC721Enumerable) {
		super._increaseBalance(account, value);
	}

	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	function supportsInterface(
		bytes4 interfaceId
	)
		public
		view
		override(ERC721, ERC721Enumerable, ERC721URIStorage)
		returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}
}
