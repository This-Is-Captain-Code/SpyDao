# SPYDAO - On-Chain Governance System

## Overview
SPY DAO is an on-chain governance system that democratizes index fund voting rights. The system includes an ERC4626 vault (SPYVault) that issues governance-enabled shares (spDAO), a Governor contract for S&P 500 shareholder proposal voting with reward mechanisms, and a backend trading system using Alpaca API to maintain SPY-mirroring portfolio positions.

## Project Status
**Current State**: MVP Complete - Smart contracts deployed, frontend operational, backend trading system active

**Last Updated**: November 19, 2025

## Features
- ✅ Minimal centered landing page design
- ✅ MetaMask wallet connection with ethers.js v6
- ✅ Wallet state management (connect/disconnect/address display)
- ✅ Beautiful responsive UI following design guidelines
- ✅ Loading, error, and connected states
- ✅ SEO meta tags and Open Graph support
- ✅ TypeScript for type safety
- ✅ Proper event listener cleanup

## Tech Stack
### Smart Contracts
- Solidity 0.8.20-0.8.25
- OpenZeppelin contracts (ERC4626, Governor, AccessControl)
- Deployed on Rayls Testnet (Chain ID: 123123)
- RPC URL: https://devnet-rpc.rayls.com

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- ethers.js v6 for Ethereum wallet integration
- TanStack Query for data fetching
- Wouter for routing
- Shadcn UI components

### Backend
- Express.js server
- PostgreSQL database (Neon)
- Alpaca Markets API for stock trading
- Portfolio rebalancing system
- Webhook service for blockchain event processing

## Project Architecture

### Key Files

**Smart Contracts:**
- `contracts/spydao.sol` - SPYVault ERC4626 contract
- `contracts/SpyDaoGovernor.sol` - Governor contract for S&P 500 proposals
- `contracts/MockUSD.sol` - Mock stablecoin for testing
- `contracts/MockSPYOracle.sol` - Mock price oracle

**Frontend:**
- `client/src/pages/home.tsx` - Landing page
- `client/src/pages/vault.tsx` - Vault operations (deposit/withdraw/delegate)
- `client/src/pages/governance.tsx` - Governance features (proposals/voting)
- `client/src/hooks/use-wallet.ts` - MetaMask wallet management
- `client/src/hooks/use-vault.ts` - Vault contract interactions
- `client/src/hooks/use-governance.ts` - Governance contract interactions
- `client/src/lib/contracts.ts` - Contract addresses and ABIs

**Backend:**
- `server/services/portfolioRebalancer.ts` - Alpaca portfolio management
- `server/services/spyTrackerService.ts` - SPY composition tracking
- `server/services/webhookService.ts` - Blockchain event processing
- `server/tradingWorker.ts` - Automated trading worker

### Design System
**Typography**:
- Heading: Space Grotesk (bold, technical crypto aesthetic)
- Body: Inter (clean, readable)
- Monospace: JetBrains Mono (for wallet addresses)

**Colors**: 
- Uses Tailwind's semantic color system with HSL variables
- Primary purple accent (hsl(262, 83%, 58%))
- Neutral grays for backgrounds and borders
- Dark mode support built-in

**Layout**:
- Extreme minimalism per user requirements
- Full viewport height centering
- Responsive breakpoints (mobile-first)

## User Journey
1. User lands on centered SPYDAO page
2. Sees "Connect Wallet" button
3. Clicks to connect MetaMask
4. Approves connection in MetaMask popup
5. Sees connected wallet address (truncated)
6. Can disconnect at any time

## Development

### Running Locally
The workflow "Start application" runs `npm run dev` which:
- Starts Express server on port 5000
- Starts Vite dev server with HMR
- Serves frontend and backend on same port

### Testing
E2E tests verify:
- Page loads and displays correctly
- SPYDAO branding and tagline visible
- Connect Wallet button functional
- MetaMask detection and error handling
- Responsive layout and typography

## Deployment Information

### Smart Contracts (Rayls Testnet)
- **Network**: Rayls Testnet
- **Chain ID**: 123123
- **RPC URL**: https://devnet-rpc.rayls.com
- **Explorer**: https://devnet-explorer.rayls.com
- **Gas Token**: USDgas
- **SPYVault**: 0x2181BaAAb16e8a4E08c7fFAB8DA1780B53eD05D2
- **MockUSD**: 0xB6c7B1ef0947596FC2d8eBE577b97f34cBBD2Fb1
- **MockSPYOracle**: 0x19a881AF139D665bD857Aedf6EDcBc0dBee52765
- **SPYDAOGovernor**: 0x4DD81784392EC93a7e88e190Baca21EfF486895D

### Configuration Notes
- **SPYDex API**: The `api.spydex.io` API doesn't exist - system uses mock SPY composition data as fallback
- **Environment Variables**: 
  - `ETHEREUM_RPC_URL` defaults to https://devnet-rpc.rayls.com
  - `CONTRACT_ADDRESS` defaults to SPYVault address
  - Production deployments should set these explicitly
  - `ALPACA_API_KEY` and `ALPACA_API_SECRET` are required for trading
  - `DATABASE_URL` is required for PostgreSQL connection

## Recent Changes
- **2025-11-19**: Network configuration and auto-switching features
  - Corrected Chain ID from 1729 to 123123 (Rayls Testnet)
  - Added automatic network detection and switching in wallet hook
  - Implemented "Switch Network" buttons on vault and governance pages
  - Fixed RPC URL from rpc.rayls.xyz to devnet-rpc.rayls.com
  - Added default fallback values for webhook service environment variables
  - Verified contract ABIs match deployed contracts
  - Confirmed Alpaca trading system is operational
  - Tested frontend loading and wallet connection interface
- **2025-11-18**: Initial implementation
  - Deployed smart contracts to Rayls Devnet
  - Created frontend with vault and governance pages
  - Implemented backend trading system with Alpaca API
  - Set up portfolio rebalancing and webhook services

## Known Issues
- Browser console may show Web3 RPC errors (-32603) when MetaMask is not connected - this is expected behavior
- SPYDex API (`api.spydex.io`) is not accessible - system correctly falls back to mock SPY composition data
- Webhook endpoints need proper API route configuration to process blockchain events

## Future Enhancements
- Replace mock SPY data with real-time ETF holdings API (Finnhub, Intrinio, or EOD Historical Data)
- Implement real-time blockchain event listening via WebSocket connections
- Add KYC verification system integration
- Implement sanctions screening service
- Add network detection and automatic switching to Rayls Devnet
- Multi-wallet support (WalletConnect, Coinbase Wallet)
- Enhanced governance features (delegation, proposal templates)
- Real-time portfolio analytics dashboard
