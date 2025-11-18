# SPYDAO Landing Page

## Overview
A minimal, beautifully designed landing page for SPYDAO (Decentralized Autonomous Organization) with MetaMask wallet authentication. Built with React, TypeScript, Vite, and ethers.js v6.

## Project Status
**Current State**: MVP Complete - Fully functional landing page with MetaMask integration

**Last Updated**: November 18, 2025

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
### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- ethers.js v6 for Ethereum wallet integration
- Wouter for routing
- Shadcn UI components

### Backend
- Express.js server
- In-memory storage (no database needed for current scope)

## Project Architecture

### Key Files
- `client/src/pages/home.tsx` - Main landing page component
- `client/src/hooks/use-wallet.ts` - Custom React hook for MetaMask wallet management
- `client/src/App.tsx` - Application root with routing
- `design_guidelines.md` - Comprehensive design system documentation
- `tailwind.config.ts` - Design tokens and theme configuration
- `client/index.html` - SEO meta tags and font imports

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

## Recent Changes
- **2025-11-18**: Initial implementation
  - Created minimal landing page with centered design
  - Implemented MetaMask integration with ethers.js v6
  - Added custom useWallet hook with proper event cleanup
  - Configured design tokens (fonts, colors, spacing)
  - Added SEO meta tags
  - Completed E2E testing

## Future Enhancements (Not in Current Scope)
- Network detection and switching
- ENS name resolution
- Wallet balance display
- Transaction history
- Multi-wallet support (WalletConnect, Coinbase Wallet)
- DAO governance features
