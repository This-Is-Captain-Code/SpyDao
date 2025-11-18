# SPY DAO - Democratizing Index Fund Governance

A revolutionary on-chain governance system that gives SPY index fund investors control over their voting rights through decentralized autonomous organization (DAO) structure.

## 🎯 Problem Statement

Index funds manage trillions in assets, but investors surrender governance rights. When Tesla or Apple holds a shareholder vote, SPY holders have no voice—State Street votes for them. This is a principal-agent failure at massive scale.

## 🚀 Solution

SPY DAO is a delegated governance vault that:

1. **Issues liquid shares** representing proportional SPY exposure via ERC4626
2. **Aggregates voting power** from all depositors into a single on-chain DAO
3. **Democratically decides** how to vote on underlying S&P 500 shareholder proposals
4. **Trustlessly verifies** off-chain execution of votes using ZKTLS proofs
5. **Enables liquid delegation**—users can delegate to activists, ESG-focused voters, or sell voting power

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USERS (Rayls Chain)                        │
│  Deposit USDC → Receive spDAO shares → Delegate Voting Power        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     ON-CHAIN (Rayls)                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │ SPYVault │─▶│  SPYDAOOracle │─▶│ SPYDAOGovernor (ERC20Votes)  │ │
│  │ ERC4626  │  │ Custom Price   │  │   - Proposals from S&P500    │ │
│  └──────────┘  │ Feed (Rayls)   │  │   - Voting Power = spDAO bal │ │
│                └──────────────┘  └──────────────────────────────┘ │
│                                   │                                │
│           ┌───────────────────────┴──────────────────────────────┐ │
│           │ ZKTLS Verifier (VoteExecutionProof.sol)               │ │
│           │   - Verifies TLS proofs of broker API calls           │ │
│           │   - Anchors off-chain execution on-chain              │ │
│           └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 🧩 Core Components

### SPYVault.sol (ERC4626)
The vault that mints governance-wrapped shares with the following features:
- **ERC4626** standard for composability
- **ERC20Votes** for snapshot governance
- **Synthetic NAV tracking**—vault value reflects off-chain holdings
- **Role-based executor**—only ZKTLS-verified service can update holdings

### SPYDAOGovernor.sol
Standard OpenZeppelin Governor with:
- Low quorum for hackathon (10 spDAO shares)
- 1 block voting delay, ~1 week voting period
- Advisory proposals for S&P 500 shareholder votes

### ZKTLS Vote Verifier
Core innovation—verify broker API calls without leaking credentials using zero-knowledge TLS proofs.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Foundry for smart contract development
- Docker for local development environment

### Deployed Addresses (Rayls Devnet)

| Contract | Address | Explorer Link |
|----------|---------|---------------|
| **MockUSD** | 0xB6c7B1ef0947596FC2d8eBE577b97f34cBBD2Fb1 | [View on Explorer](https://devnet-explorer.rayls.com/address/0xB6c7B1ef0947596FC2d8eBE577b97f34cBBD2Fb1) |
| **MockSPYOracle** | 0x19a881AF139D665bD857Aedf6EDcBc0dBee52765 | [View on Explorer](https://devnet-explorer.rayls.com/address/0x19a881AF139D665bD857Aedf6EDcBc0dBee52765) |
| **SPYVault** | 0x2181BaAAb16e8a4E08c7fFAB8DA1780B53eD05D2 | [View on Explorer](https://devnet-explorer.rayls.com/address/0x2181BaAAb16e8a4E08c7fFAB8DA1780B53eD05D2) |
| **SPYDAOGovernor** | 0x4DD81784392EC93a7e88e190Baca21EfF486895D | [View on Explorer](https://devnet-explorer.rayls.com/address/0x4DD81784392EC93a7e88e190Baca21EfF486895D) |

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spy-dao
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🛠️ Development

### Tech Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Wouter** for client-side routing
- **TanStack Query** for data fetching and caching
- **Framer Motion** for animations

#### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database management
- **Neon Database** for PostgreSQL
- **WebSocket** for real-time updates

#### Smart Contracts
- **Solidity** 0.8.20
- **OpenZeppelin** contracts for standards compliance
- **Rayls** blockchain for deployment

#### Integration
- **Alpaca API** for trading integration
- **Ethers.js** for Web3 interactions
- **Web3Modal** for wallet connections

### Project Structure

```
spy-dao/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── styles/        # Global styles
├── server/                # Backend Express application
│   ├── db/               # Database schema and migrations
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   └── models/           # Data models
├── contracts/            # Solidity smart contracts
│   ├── spydao.sol        # Main SPYVault contract
│   ├── SpyDaoGovernor.sol # DAO governance contract
│   └── mockusd.sol       # Mock USDC token
├── pitchdeck/            # Pitch deck materials
└── docs/                 # Additional documentation
```

## 🧪 Testing

### Smart Contract Testing
```bash
forge test
```

### Frontend Testing
```bash
npm test
```

### End-to-End Testing
```bash
npm run test:e2e
```

## 🔐 Security

This project implements multiple security layers:

- **Access Control**: Role-based permissions throughout
- **Input Validation**: Comprehensive validation on all user inputs
- **Reentrancy Protection**: Non-reentrant modifiers on critical functions
- **Oracle Security**: Multiple data sources and circuit breakers
- **ZKTLS Verification**: Zero-knowledge proofs for off-chain execution

## 🌐 API Documentation

### REST API Endpoints

- `GET /api/portfolio/:userId` - Get user portfolio
- `POST /api/deposit` - Deposit funds to vault
- `POST /api/withdraw` - Withdraw from vault
- `GET /api/proposals` - Get active governance proposals
- `POST /api/vote` - Submit governance vote
- `GET /api/delegates` - Get available delegates
- `POST /api/delegate` - Update delegation preferences

### WebSocket Events

- `portfolio:update` - Real-time portfolio updates
- `proposal:new` - New governance proposals
- `vote:submitted` - Vote confirmations
- `execution:verified` - ZKTLS verification updates

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📈 Roadmap

### Phase 1 (MVP - Q1 2024)
- ✅ Basic vault functionality (deposit/withdraw)
- ✅ Governance voting on S&P 500 proposals
- ✅ Basic UI for portfolio management
- ✅ Mock ZKTLS verification

### Phase 2 (Alpha - Q2 2024)
- 🔄 Live ZKTLS with Empyreal SDK
- 🔄 Delegate marketplace
- 🔄 Dividend handling
- 🔄 Multi-chain support

### Phase 3 (Beta - Q3 2024)
- 🔄 Corporate actions processing
- 🔄 Advanced delegation mechanisms
- 🔄 Cross-chain governance
- 🔄 Mobile app

### Phase 4 (Production - Q4 2024)
- 🔄 Full legal compliance
- 🔄 Institutional integrations
- 🃽 DeFi composability
- 🔄 Governance analytics

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin** for comprehensive contract libraries
- **Rayls** for blockchain infrastructure
- **Empyreal** for ZKTLS verification technology
- **Hackathon participants** for valuable feedback and testing

## 📞 Support

For questions or support, please:
- Check our [Documentation](docs/)
- Join our [Discord community](https://discord.gg/spydao)
- Open an [issue](https://github.com/spydao/issues) on GitHub

## 🏆 Built at Rayls Hackathon

This project was developed during the Rayls Decentralized Finance Hackathon, focusing on bringing real-world asset governance on-chain through zero-knowledge proofs and decentralized autonomous organizations.
