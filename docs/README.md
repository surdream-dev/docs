# SurDream Protocol Addresses

SurDream is a DeFi interface that helps users access staking, stablecoin yield, and lending strategies across Ethereum mainnet. The product does not deploy or custody funds through proprietary contracts. Instead, every strategy interacts directly with official protocol contracts and standard token contracts, so the wallet transaction target and token approval spender are the official addresses listed in this reference.

## What This Site Contains

This static site organizes the protocol and token addresses actually used by the SurDream codebase into five categories:

- Base Tokens
- Staking
- Stablecoin Yield
- Lending
- Infrastructure

Each entry includes the contract name, symbol or contract alias, address, purpose, and any note required for verification. Addresses can be copied directly or opened on Etherscan.

## Address Scope

The list is generated from the addresses referenced in real product call paths, not from protocol documentation or third-party address lists. The following are intentionally excluded:

- RWA-related addresses for now
- Addresses that exist only in the registry but are not referenced by any call path

Some Morpho addresses are reused in the codebase under multiple aliases. These entries include a note in the address data so reviewers can verify the usage.

## Contact

For security questions or address verification, contact [alice@surdream.com](mailto:alice@surdream.com).
