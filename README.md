# 🔗 Solana Asset Manager

> **Enterprise-Grade Asset Management on Solana Blockchain**  
> Register, tokenize, track, and manage physical/digital assets with immutable on-chain audit trails.

[![GitHub](https://img.shields.io/badge/github-minhnhzt%2Fasset--chain-blue?logo=github)](https://github.com/minhnhzt/asset-chain)
[![Built with](https://img.shields.io/badge/built%20with-Next.js%2C%20Anchor%2C%20Solana-blueviolet)](https://solana.com)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Smart Contract](#smart-contract)
- [Frontend](#frontend)
- [API Routes](#api-routes)
- [Testing](#testing)
- [Deployment](#deployment)
- [Key Concepts](#key-concepts)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Solana Asset Manager** is an MVP platform combining blockchain smart contracts with a modern web frontend to enable SMBs (Small and Medium Businesses) to:

1. **Register assets** on Solana devnet with metadata
2. **Mint SPL tokens** (NFT-style, 1 token = 1 asset)
3. **Track maintenance** with immutable on-chain history
4. **Manage status** (ACTIVE → MAINTENANCE → RETIRED → DISPOSED)
5. **Export reports** via CSV for compliance

**Why Blockchain?**
- ✅ Immutable audit trail (fraud-proof)
- ✅ Decentralized ownership (user controls keys)
- ✅ Low cost (~$0.0003 per asset)
- ✅ Real-time transparency across stakeholders

**Target Users:**
- **Manager:** Asset registration, KPI viewing, CSV export
- **Technician:** Maintenance logging (mobile + offline)
- **Admin:** Workflow configuration, bulk import/export

---

## ✨ Features

### Core Features (MVP)

| Feature | Status | Details |
|---------|--------|---------|
| **Asset Registration** | ✅ Complete | Mint unique SPL tokens per asset |
| **Tokenization** | ✅ Complete | 0-decimal SPL tokens (NFT-style) |
| **Maintenance Logging** | ✅ Complete | Circular buffer (max 50 entries) |
| **Status Management** | ✅ Complete | 4-state lifecycle (ACTIVE/MAINTENANCE/RETIRED/DISPOSED) |
| **History Tracking** | ✅ Complete | Immutable on-chain audit trail |
| **CSV Export** | ✅ Complete | Download asset reports |
| **Multi-Signature Workflows** | ✅ Complete | M-of-N approval thresholds for critical operations |

### Upcoming (Post-MVP)

- [ ] CSV Import (bulk asset creation)
- [ ] Advanced KPIs (downtime %, ROI analysis)
- [ ] Mobile app (React Native)
- [ ] Mainnet support (production deployment)
- [ ] Blockchain-anchored multi-sig proofs (on-chain verification)

---

## 🛠 Tech Stack

### On-Chain (Smart Contract)

```
Anchor 0.30.1          Smart contract framework
Rust 2021 edition      High-performance blockchain code
Solana SDK             Web3 libraries
SPL Token Program      Tokenization
```

- **Program ID:** `9Vv8pXNcSPUUXvZwWM9FGYbzat4V1m9AV5fZz4Br8KxE`
- **Binary Size:** 406 KB
- **IDL Size:** 18.5 KB

### Off-Chain (Frontend)

```
Next.js 15.5.4         React framework + SSR
React 19.1.0           UI components
TypeScript 5           Type-safe code
Tailwind CSS 4         Responsive design
Phantom Wallet         Solana wallet integration
@solana/web3.js        Blockchain client
```

### Infrastructure

```
Vercel                 Frontend hosting (free tier)
Solana Devnet          Blockchain network
IPFS                   Distributed metadata storage (planned)
Helius RPC             Solana RPC endpoint (optional)
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
npm or yarn
Rust 1.70+ (for smart contract development)
Anchor CLI 0.30.1+
Solana CLI 1.18+
Phantom Wallet (browser extension)
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/minhnhzt/asset-chain.git
cd asset-chain

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your RPC endpoint (default: devnet)
```

### Development

```bash
# Start local validator (if developing smart contract)
solana-test-validator

# Build smart contract
yarn run build-program

# Start frontend dev server
npm run dev
# Open http://localhost:3000

# Run tests
yarn run test-program

# View logs
yarn run logs
```

### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
├── app/                           # Next.js frontend
│   ├── components/                # React components
│   │   ├── WalletConnectButton.tsx    # Phantom wallet UI
│   │   ├── RegisterAssetForm.tsx      # Asset registration form
│   │   ├── AssetList.tsx              # Asset listing table
│   │   └── LoadingSpinner.tsx         # Loading states
│   ├── api/                       # API routes
│   │   ├── assets/route.ts            # Asset CRUD
│   │   └── maintenance-logs/route.ts  # Maintenance endpoints
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard page
│   ├── types.ts                   # TypeScript interfaces
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
│
├── programs/
│   └── asset-manager/             # Anchor smart contract
│       ├── src/
│       │   ├── lib.rs             # Entry point (5 instructions)
│       │   ├── accounts.rs        # Account structs + errors
│       │   ├── events.rs          # Event definitions
│       │   └── instructions.rs    # Handler logic
│       ├── Cargo.toml             # Rust dependencies
│       └── target/                # Build output
│           ├── sbpf-solana-solana/
│           │   └── release/
│           │       └── asset_manager.so  # SBPF binary
│           └── idl/
│               └── asset_manager.json    # IDL types
│
├── tests/
│   └── asset-manager.ts           # Integration tests (8 cases)
│
├── scripts/
│   ├── initialize.ts              # Deploy script
│   └── client-example.ts          # Usage example
│
├── public/                        # Static assets
├── deploy-program.sh              # Deployment script
├── Anchor.toml                    # Anchor config
├── package.json                   # Node dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.ts                 # Next.js config
└── README.md                      # This file
```

---

## 🔗 Smart Contract

### Architecture

**5 Core Instructions:**

1. **`register_asset`** - Create new asset with metadata
2. **`initialize_maintenance_log`** - Set up maintenance tracking
3. **`add_maintenance_log`** - Append maintenance entry
4. **`update_asset_metadata`** - Change asset metadata CID
5. **`update_asset_status`** - Change asset status (ACTIVE/MAINTENANCE/RETIRED/DISPOSED)

### Account Structures

#### Asset Account
```rust
pub struct Asset {
    pub owner: Pubkey,              // Owner wallet
    pub name: String,               // Asset name (max 128 bytes)
    pub location: String,           // Location (max 256 bytes)
    pub metadata_cid: String,       // IPFS metadata reference
    pub status: u8,                 // 0=ACTIVE, 1=MAINTENANCE, 2=RETIRED, 3=DISPOSED
    pub created_at: i64,            // Timestamp
    pub updated_at: i64,            // Last update
    pub bump: u8,                   // PDA bump
}
```

#### Maintenance Log Account
```rust
pub struct MaintenanceLog {
    pub asset: Pubkey,              // Reference to asset
    pub owner: Pubkey,              // Owner wallet
    pub entries: Vec<MaintenanceLogEntry>,  // Max 50 entries (circular buffer)
    pub entry_count: u32,           // Total entries ever added
    pub bump: u8,                   // PDA bump
}

pub struct MaintenanceLogEntry {
    pub performer: Pubkey,          // Who logged this
    pub note: String,               // Description (max 256 bytes)
    pub timestamp: i64,             // When it happened
    pub ipfs_cid: String,           // Optional detailed data on IPFS
}
```

### PDA Seeds

All accounts use deterministic PDAs:

```typescript
// Asset account
["asset", owner_pubkey, asset_name] → Asset account

// Maintenance log
["maintenance_log", asset_pubkey] → MaintenanceLog account

// Mint token
[asset_pubkey.toBuffer()] → SPL token mint
```

### Error Codes

```rust
pub enum AssetManagerError {
    StringTooLong,              // Metadata exceeds 256 bytes
    InvalidStatus,              // Status not in 0-3
    MaxLogEntriesReached,       // Maintenance log full (50 entries)
    UnauthorizedAccess,         // Non-owner modification
    MathOverflow,               // Arithmetic error
}
```

### Events

```rust
pub event AssetCreated {
    pub asset: Pubkey,
    pub owner: Pubkey,
    pub name: String,
}

pub event MaintenanceLogged {
    pub asset: Pubkey,
    pub performer: Pubkey,
    pub note: String,
}

pub event StatusChanged {
    pub asset: Pubkey,
    pub old_status: u8,
    pub new_status: u8,
}
// ... and more
```

### Build & Deploy

```bash
# Build SBPF binary
yarn run build-program

# Deploy to devnet
./deploy-program.sh devnet

# Verify deployment
solscan https://solscan.io/account/9Vv8pXNcSPUUXvZwWM9FGYbzat4V1m9AV5fZz4Br8KxE?cluster=devnet
```

---

## 🎨 Frontend

### Pages

#### Landing Page (`/`)
- Hero section with product overview
- Feature highlights with emojis
- 4-step onboarding flow
- Call-to-action buttons to dashboard

#### Dashboard (`/dashboard`)
- Wallet connection UI (Phantom)
- Asset registration form
- Real-time asset listing table
- Status badges (color-coded)
- Maintenance log viewer

#### API Routes

**GET `/api/assets`**
- Fetch all assets
- Cache: 60s TTL
- Response:
```json
{
  "assets": [
    {
      "id": "asset_id",
      "name": "Equipment A",
      "location": "Building 1",
      "status": "ACTIVE",
      "createdAt": "2025-10-24T10:00:00Z"
    }
  ]
}
```

**POST `/api/assets`**
- Create new asset
- Body:
```json
{
  "name": "Equipment A",
  "location": "Building 1",
  "metadataCid": "QmXxxx"
}
```

**GET `/api/maintenance-logs?assetId=xxx`**
- Fetch maintenance logs for asset
- Response:
```json
{
  "logs": [
    {
      "id": "log_id",
      "performer": "tech@company.com",
      "note": "Oil change completed",
      "timestamp": "2025-10-24T14:30:00Z"
    }
  ]
}
```

**POST `/api/maintenance-logs`**
- Add maintenance entry
- Body:
```json
{
  "assetId": "asset_id",
  "note": "Routine maintenance",
  "ipfsCid": "optional"
}
```

### Components

#### `WalletConnectButton`
- Phantom wallet connection
- Display wallet balance
- Show connected address

#### `RegisterAssetForm`
- Form validation (string lengths, required fields)
- Real-time error messages
- Submit loading state
- Success notification

#### `AssetList`
- Paginated asset table
- Status color badges
- Search functionality
- Delete asset button

#### `LoadingSpinner`
- Loading animation
- Message display
- Used during async operations

### Type Definitions

```typescript
interface AssetData {
  id: string;
  name: string;
  location: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'DISPOSED';
  createdAt: string;
  updatedAt: string;
  metadataCid: string;
}

interface MaintenanceLog {
  id: string;
  assetId: string;
  performer: string;
  note: string;
  timestamp: string;
  ipfsCid?: string;
}
```

### Styling

- **Framework:** Tailwind CSS 4 (utility-first)
- **Responsiveness:** Mobile-first design
- **Color Scheme:** Blue/Indigo gradient
- **Icons:** Text emojis + Tailwind SVG utilities

---

## 🔐 Multi-Signature Workflows

### Overview

**Multi-signature approval workflows** enable M-of-N governance for critical asset operations. Require multiple stakeholders to approve changes before execution.

### Features

- ✅ **Flexible Thresholds**: Configure any M-of-N (e.g., 2-of-3, 3-of-5)
- ✅ **4 Request Types**: UPDATE_METADATA, CHANGE_STATUS, RETIRE_ASSET, ADD_APPROVER
- ✅ **Real-Time Voting**: Instant notifications and status updates
- ✅ **Audit Trail**: Immutable record of all approvals/rejections
- ✅ **Automatic Execution**: Status changes when thresholds met

### Use Cases

| Scenario | Threshold | Benefit |
|----------|-----------|---------|
| Update asset location | 2-of-3 managers | Prevents unauthorized changes |
| Move to maintenance | 1-of-2 technicians | Quick response time |
| Retire asset | 3-of-4 directors | Strong governance |
| Add approver | Majority (2-of-3) | Maintains transparency |

### API Endpoints

**Configure Multi-Sig**
```typescript
POST /api/multisig-config
{
  "assetId": "asset_123",
  "approvers": ["wallet1", "wallet2", "wallet3"],
  "requiredApprovals": 2,
  "owner": "owner_wallet"
}
```

**Create Approval Request**
```typescript
POST /api/multisig-requests
{
  "requestType": "UPDATE_METADATA",
  "assetId": "asset_123",
  "approvers": ["wallet1", "wallet2", "wallet3"],
  "requiredApprovals": 2,
  "requestData": { "newMetadataCid": "QmNewHash..." },
  "createdBy": "requester_wallet"
}
```

**Submit Vote**
```typescript
POST /api/multisig-requests/req_1
{
  "approverPubkey": "wallet1",
  "approvalStatus": "APPROVED"
}
```

### React Components

1. **`MultiSigConfigForm`** - Set up approval groups and thresholds
2. **`MultiSigRequestForm`** - Create approval requests
3. **`MultiSigApprovalPanel`** - Approver dashboard with voting interface
4. **`MultiSigRequestHistory`** - View all requests with filtering

### Quick Example

```typescript
import MultiSigConfigForm from '@/app/components/MultiSigConfigForm';

// 1. Configure multi-sig for asset
<MultiSigConfigForm
  assetId="asset_123"
  ownerPubkey={wallet.publicKey.toString()}
  onConfigCreated={(config) => console.log('Configured')}
/>

// 2. Create request (requires 2-of-3 approvals)
// 3. Approvers vote
// 4. When 2 approvals reached → Status changes to APPROVED
// 5. Ready to execute on-chain
```

### Documentation

- **Complete Guide:** [`docs/MULTISIG_WORKFLOWS.md`](docs/MULTISIG_WORKFLOWS.md)
- **Integration Examples:** [`docs/MULTISIG_INTEGRATION_GUIDE.md`](docs/MULTISIG_INTEGRATION_GUIDE.md)
- **Quick Reference:** [`docs/MULTISIG_QUICK_REFERENCE.md`](docs/MULTISIG_QUICK_REFERENCE.md)

---

## 🧪 Testing

### Test Suite

**File:** `tests/asset-manager.ts`  
**Coverage:** 8 integration test cases  
**Framework:** Anchor + Mocha + Chai

### Test Cases

1. ✅ Asset registration (create asset with metadata)
2. ✅ Maintenance log initialization
3. ✅ Maintenance log entry creation
4. ✅ Maintenance log overflow (circular buffer)
5. ✅ Asset metadata update
6. ✅ Asset status lifecycle transitions
7. ✅ Unauthorized access rejection
8. ✅ Error handling (invalid inputs)

### Run Tests

```bash
# Start local validator
solana-test-validator

# Run test suite (in another terminal)
yarn run test-program

# View coverage
yarn run test-program --coverage
```

### Example Test

```typescript
it("Creates a new asset", async () => {
  const tx = await program.methods.registerAsset(
    "Equipment A",
    "Building 1",
    "QmXxxx"
  )
    .accounts({
      asset: assetPda,
      owner: owner.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([owner])
    .rpc();

  const asset = await program.account.asset.fetch(assetPda);
  expect(asset.name).to.equal("Equipment A");
  expect(asset.owner.toString()).to.equal(owner.publicKey.toString());
});
```

---

## 🚀 Deployment

### Frontend → Vercel

**Option 1: Automatic (Recommended)**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import GitHub repo (minhnhzt/asset-chain)
3. Set environment variables:
   ```
   NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_PROGRAM_ID=9Vv8pXNcSPUUXvZwWM9FGYbzat4V1m9AV5fZz4Br8KxE
   ```
4. Deploy (automatic on git push)

**Option 2: Manual CLI**

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Smart Contract → Devnet

```bash
# 1. Get devnet SOL
# https://faucet.solana.com/ or Discord #devnet-airdrops

# 2. Deploy program
./deploy-program.sh devnet

# 3. Verify on Solscan
# https://solscan.io/account/9Vv8pXNcSPUUXvZwWM9FGYbzat4V1m9AV5fZz4Br8KxE?cluster=devnet
```

### Environment Variables

Create `.env.local`:

```bash
# Frontend
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=9Vv8pXNcSPUUXvZwWM9FGYbzat4V1m9AV5fZz4Br8KxE

# Optional: Custom RPC endpoint
NEXT_PUBLIC_RPC_ENDPOINT=https://api.helius.xyz/v0/access-token=YOUR_TOKEN

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Production Checklist

- [ ] Frontend built (`npm run build`)
- [ ] Tests pass (`yarn run test-program`)
- [ ] Smart contract deployed to devnet
- [ ] Environment variables set on Vercel
- [ ] Wallet address whitelisted (if applicable)
- [ ] Rate limits configured for RPC calls
- [ ] Error logging enabled (Sentry/DataDog)

---

## 📚 Key Concepts

### SPL Tokens (0 Decimals)

Each asset gets a unique SPL token:
- **Total Supply:** 1
- **Decimals:** 0 (non-divisible, like an NFT)
- **Authority:** Asset account (PDA)
- **Purpose:** Proof of ownership on-chain

**Why?** Ensures asset uniqueness and enables future marketplace integration.

### Circular Buffer Maintenance Log

Maintenance entries stored in a capped Vec (max 50):
```rust
// When adding new entry:
if entries.len() >= 50 {
    entries.remove(0);  // Remove oldest
}
entries.push(new_entry);
```

**Benefits:**
- ✅ Fixed account size (prevents bloat)
- ✅ Recent history always available
- ✅ Predictable on-chain cost

### Hybrid Metadata Storage

| Type | Storage | Mutability | Cost |
|------|---------|-----------|------|
| **Status & Timestamps** | On-chain | Immutable | ~0.001 SOL |
| **IPFS CID Reference** | On-chain | Read-only | Included |
| **Full Metadata JSON** | IPFS | Mutable | Free (3rd party) |

Example workflow:
1. Create `asset.json` with all details
2. Upload to IPFS → get CID
3. Pass CID to `register_asset` instruction
4. Update metadata without on-chain txn (just re-upload to IPFS)

### PDA Derivation

Program Derived Accounts (PDAs) are deterministic keypairs:

```typescript
// Seed → Address
const [assetPda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("asset"), ownerKey.toBuffer(), assetName],
  programId
);
// Same input → Same PDA always

// No private key needed → Only program can sign
```

**Why PDAs?**
- ✅ Deterministic (reproducible on client)
- ✅ Program-controlled (secure)
- ✅ No key management (single account per entity)

---

## 🛠 Troubleshooting

### Issue: Port 3000 already in use

```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Issue: Phantom wallet not connecting

- ✅ Install [Phantom wallet](https://phantom.app)
- ✅ Create account on Solana devnet
- ✅ Request devnet SOL from faucet
- ✅ Hard refresh browser (Cmd+Shift+R)

### Issue: RPC rate limit exceeded

```bash
# Use Helius free tier (50 requests/second)
NEXT_PUBLIC_RPC_URL=https://api.helius.xyz/v0/access-token=YOUR_TOKEN

# Or run local validator
solana-test-validator
NEXT_PUBLIC_RPC_URL=http://localhost:8899
```

### Issue: Smart contract build fails

```bash
# Update Rust toolchain
rustup update nightly-2025-10-20
rustup override set nightly-2025-10-20

# Clear Cargo cache
cargo clean
rm -rf ~/.cargo/registry/src/*/base64ct*

# Rebuild
yarn run build-program
```

### Issue: Transaction signature pending

- ✅ Wait 5-10 seconds (devnet can be slow)
- ✅ Check [Solscan](https://solscan.io/?cluster=devnet)
- ✅ Verify RPC endpoint has block 0 (validator running)

### Issue: "PDA not owned by program"

- ✅ Verify seeds match program exactly
- ✅ Check program ID in instruction
- ✅ Ensure bump derivation is consistent

---

## 📊 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Asset registration | < 5s | ✅ ~2-3s (devnet) |
| Asset listing (100 assets) | < 2s | ✅ ~1.5s (with cache) |
| Maintenance log append | < 2s | ✅ ~1.5s |
| Frontend build time | < 60s | ✅ ~3.4s |
| Frontend bundle size | < 500KB | ✅ ~120KB (First Load JS) |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow Rust naming conventions (snake_case)
- Use TypeScript for all frontend code (no `any` types)
- Write tests for new features (>80% coverage)
- Update README if adding new features
- Use Prettier for code formatting

### Code of Conduct

Be respectful, inclusive, and constructive.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Solana Foundation** - For the amazing blockchain platform
- **Anchor team** - For the Solana framework
- **Vercel** - For hosting infrastructure
- **Phantom Wallet** - For wallet integration

---

## 📞 Support

- 📧 Email: support@assetmanager.sol
- 💬 Discord: [Join our server](https://discord.gg/solana)
- 🐦 Twitter: [@AssetManagerSol](https://twitter.com)
- 📖 Docs: [Full documentation](https://docs.assetmanager.sol)

---

## 🎯 Roadmap

### Oct 2025 (MVP)
- ✅ Asset registration & tokenization
- ✅ Maintenance logging
- ✅ Status management
- ✅ Basic reporting

### Q1 2026
- [ ] CSV bulk import
- [ ] Advanced KPIs (ROI, downtime %)
- [ ] Mobile app (React Native)
- [ ] Multi-signature workflows

### Q2 2026
- [ ] Mainnet deployment
- [ ] DAO governance
- [ ] 3rd-party integrations (SAP, Oracle)
- [ ] API v2 with batch operations

### Q3 2026+
- [ ] AI-powered maintenance prediction
- [ ] IoT sensor integration
- [ ] Real-time asset marketplace
- [ ] Global expansion

---

**Built with ❤️ on Solana devnet | Oct 2025 MVP**

[⬆ Back to top](#-solana-asset-manager)
