# AI Coding Agent Instructions for Solana Asset Manager

## Project Overview

This is a **Solana-based asset management platform** combining an Anchor smart contract program with a Next.js web frontend. The application enables SMBs to register, tokenize, and track physical/digital assets on Solana devnet with hybrid on-chain/off-chain metadata storage.

**MVP Phase:** 03/10 - 25/10 (PoC demo with 4 core features, target ≥80% flows pass)

**Tech Stack:**
- **On-Chain:** Rust + Anchor framework (SPL token integration)
- **Off-Chain:** Next.js 15 (TypeScript, Tailwind CSS), IPFS metadata storage
- **Testing:** Anchor test suite (ts-mocha), Solana local validator
- **Backend API:** Node.js with Helius RPC proxy, offline tx queue support

**Target Users & Workflows:**
- **Manager:** Asset registration, KPI viewing, CSV export
- **Technician:** Maintenance logging (mobile + offline-first), history viewing
- **Admin:** Maintenance scheduling, CSV import/export, workflow configuration

---

## Architecture & Critical Integration Points

### MVP Feature Scope

The 4 core features funded through Oct 25 MVP:

1. **Asset Registration & Tokenization** — One-click mint SPL tokens (NFT-style for unique assets)
2. **Tracking & History** — Responsive dashboard showing immutable on-chain transaction history + basic offline sync
3. **Basic Maintenance Scheduling** — Off-chain scheduler + on-chain proof/log, simple reminders
4. **Reporting** — Basic KPIs (asset lifespan, downtime) + CSV export

### On-Chain Program Structure

**MVP Implementation:** The new `asset-registry` program (replacing `asset-manager`) implements 5 core instructions:

1. **`register_asset(name, location, metadata_cid)`** — Creates new asset with PDA seed: `["asset", owner, name]`
2. **`initialize_maintenance_log()`** — Creates capped log account with PDA seed: `["maintenance_log", asset]`
3. **`add_maintenance_log(note, ipfs_cid)`** — Appends entry (circular buffer, max 50)
4. **`update_asset_metadata(new_metadata_cid)`** — Owner-only CID update
5. **`update_asset_status(new_status)`** — Owner-only status change (ACTIVE=0, MAINTENANCE=1, RETIRED=2, DISPOSED=3)

**Key Files:**
- `programs/asset-registry/src/lib.rs` — Entry point (5 instructions, ~70 LOC)
- `programs/asset-registry/src/accounts.rs` — Asset, MaintenanceLog, error codes (~110 LOC)
- `programs/asset-registry/src/events.rs` — 5 events for off-chain indexing (~40 LOC)
- `programs/asset-registry/src/instructions.rs` — Handler logic (~260 LOC)

**Key Data Models:**
- `Asset`: owner, name (128 bytes max), location (256 bytes), metadata_cid (256 bytes), status u8, timestamps, bump
- `MaintenanceLog`: asset ref, owner, entries Vec (capped 50), bump
- `MaintenanceLogEntry`: performer, note (256 bytes), timestamp, ipfs_cid

**Critical Patterns:**
- All PDAs use explicit seeds + bump derivation for deterministic account discovery
- SPL token created with 0 decimals (NFT-style, 1 token = 1 asset, ensures uniqueness)
- Metadata CID stored on-chain (256 byte limit), full details on IPFS for mutability
- Token authority delegated to `asset_account` for burn/mint operations
- Owner-based access control via `has_one` Anchor constraint
- Maintenance log is capped (max 50) to prevent account bloat; oldest entries overwritten when limit reached

### Off-Chain Frontend Integration

**MVP Implementation Complete:**

- **API Layer:** `app/api/assets/route.ts` (GET/POST), `app/api/maintenance-logs/route.ts`
  - GET /api/assets → fetch all assets (in-memory cache 60s TTL)
  - POST /api/assets → register new asset
  - GET /api/maintenance-logs?assetId=... → fetch logs for asset
  - POST /api/maintenance-logs → add maintenance entry
  
- **Frontend Components:**
  - `app/components/WalletConnectButton.tsx` — Phantom wallet UI + balance
  - `app/components/RegisterAssetForm.tsx` — Asset registration form with validation
  - `app/components/AssetList.tsx` — Paginated asset table with status badges
  - `app/dashboard/page.tsx` — Main dashboard (form + list side-by-side)

- **Features:**
  - ✅ Form validation (string lengths, required fields)
  - ✅ Real-time asset listing with search
  - ✅ Status color-coded badges
  - ✅ Loading states & error messages
  - ✅ Responsive design (mobile-first, Tailwind CSS)
  - ✅ Cache for KPI: < 2s asset listing

- **Wallet:** Phantom integration via @solana/wallet-adapter-react
- **RPC:** Configurable (devnet default in .env.local)
- **Caching:** In-memory with 60s TTL (production: Redis)

---

## Success Metrics & Measurement Strategy

All success metrics are tied to measurable KPIs verified through **MVP demo (Oct 23-25)**:

| Metric | Target | Measurement Method | Notes |
|--------|--------|-------------------|-------|
| Transaction Speed | < 5s (devnet) | Script logs timestamp from click → confirmed tx signature | Devnet-specific; normal Solana latency 0.4-1s block time |
| Asset Listing Performance | < 2s (100 assets) | Measure TTFB + total render time; log backend cache hit ratio | Critical for manager dashboard responsiveness |
| Core Flows Pass Rate | ≥ 80% | 5-6 core user flows (register → tokenize → log maintenance → view history → retire); 1 clean take recorded | MVP success depends on this |
| Smart Contract Coverage | ≥ 80% | Anchor test suite coverage report with badge | Includes all 6 instructions + error cases |
| Evidence for Demo | tx signatures, screenshots, video | Collect during testing phase (19-22/10) | Show immutability, tx finality, offline sync behavior |

---

## Development Timeline & Phase Breakdown

**Phase 1: Requirements & Design (03/10 - 10/10)** [COMPLETE]
- Scope defined via 5W1H
- Architecture diagram + UI mockups created
- Smart contract blueprint designed

**Phase 2: Backend Development (11/10 - 18/10)** [IN PROGRESS]
- [ ] Smart contract implementation (Rust/Anchor)
- [ ] Tokenization & SPL integration
- [ ] Maintenance log schema + circular buffer logic
- [ ] Node.js backend + Helius RPC integration
- [ ] IPFS metadata storage
- [ ] Local testing with validator

**Phase 3: Frontend Development (11/10 - 18/10)** [CONCURRENT]
- [ ] React/Next.js setup + Phantom wallet adapter
- [ ] Dashboard & asset registration UI
- [ ] Offline sync queue implementation
- [ ] Mobile-responsive design
- [ ] Integration with backend API

**Phase 4: Testing & QA (19/10 - 22/10)** [UPCOMING]
- [ ] Unit tests (≥80% coverage)
- [ ] Integration e2e tests
- [ ] Security audit (wallet, signer, rate limits)
- [ ] UAT on devnet with 5-6 core flows
- [ ] Record clean demo video

**Phase 5: Deploy & Pitch (23/10 - 25/10)** [UPCOMING]
- [ ] Deploy frontend to Vercel
- [ ] Deploy contracts to devnet
- [ ] Performance monitoring
- [ ] Demo script + pitch deck
- [ ] Post-mortem review

---

### Build & Test the Program

```bash
# Build Anchor program (generates IDL in target/idl/, types in target/types/)
yarn run build-program

# Run test suite (requires Solana validator running locally on 8899)
yarn run test-program

# Start local validator for development
yarn run localnet

# View real-time transaction logs
yarn run logs
```

### Deploy Program

Use the provided deployment script:
```bash
bash deploy.sh
# Interactive prompts for network selection (localnet/devnet/testnet/mainnet)
```

After deployment, initialize global state:
```bash
# Update Anchor.toml with new program ID, then:
anchor run initialize
```

### Frontend Development

```bash
# Start Next.js dev server (port 3000)
yarn run dev

# Build production bundle
yarn build

# Lint TypeScript/React
yarn lint
```

### Key Build Artifacts

- **IDL (Interface Definition Language):** `target/idl/asset_manager.json` — Anchor-generated type definitions; used by tests and frontend client code
- **Program Types:** `target/types/asset_manager.ts` — Auto-generated TypeScript bindings for instruction/account structs
- **Program Binary:** `programs/asset-manager/target/sbpf-solana-solana/release/asset_manager.so` — Deployable WASM binary

---

## Project-Specific Conventions

### Account Derivation & PDA Seeds

Every account uses deterministic PDAs. Always derive before creating:
```typescript
// Example: Asset account PDA
const [assetAccountPda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("asset"), mintPublicKey.toBuffer()],
  programId
);
```

**Never hardcode pubkey addresses.** Derive PDAs consistently across tests, scripts, and frontend.

### Metadata Storage Strategy (Hybrid Model)

- **On-chain (immutable):** Metadata CID reference + status flag + timestamps
- **IPFS (mutable):** Detailed metadata JSON (name, location, category, description, image URL)
- **Why:** Reduces on-chain storage costs; allows editing metadata without on-chain transactions
- **Conflict Resolution:** Prioritize newest writes by timestamp; warn if metadata is stale relative to on-chain update time

When creating/updating assets, always upload metadata to IPFS first, capture CID, then pass to smart contract.

### Offline Sync Strategy

- **Local Queue:** Transactions pending submission stored with state `pending → confirmed → failed`
- **Retry Logic:** Exponential backoff when offline; auto-retry when online detected
- **Reconciliation:** Conflict handling prioritizes newest write; alerts user if metadata diverges
- **UI Feedback:** Show tx signatures immediately upon confirmation for immutable proof

### Error Handling

Custom error enum `AssetManagerError` includes:
- `StringTooLong` — Metadata CID exceeds 256 bytes
- `InvalidStatus` — Status code not in 0–3 range
- `MaxLogEntriesReached` — Maintenance log at 50 entries
- `UnauthorizedAccess` — Non-owner attempt to modify asset
- `MathOverflow` — Counter overflow (unlikely)

In tests/frontend, match Anchor error codes to these messages for user-friendly error reporting.

### Test Structure

Tests in `tests/asset-manager.ts` use **Anchor + Mocha + Chai**:
- **Setup phase** (`before`):** Derive all PDAs, airdrop SOL to test accounts
- **Test cases:** Each instruction has dedicated test; verify account state post-transaction
- **Key pattern:** Always fetch account after instruction to validate state changes

Example pattern:
```typescript
it("Creates a new asset", async () => {
  const tx = await program.methods.createAsset(metadataCid, 0)
    .accounts({ /* derived PDAs */ })
    .signers([owner, mint])
    .rpc();
  
  const assetAccount = await program.account.assetAccount.fetch(assetAccountPda);
  expect(assetAccount.owner.toString()).to.equal(owner.publicKey.toString());
});
```

### Responsive Frontend Patterns

- Mobile-first design (Next.js + Tailwind CSS 4)
- Phantom wallet integration for signing transactions
- Offline sync model: queue transactions locally → retry with backoff when online
- Dashboard shows immutable transaction history from on-chain logs

---

## Cross-Component Communication

### Client → Program Flow

1. **User interacts with Next.js UI**
2. **Frontend derives all account PDAs** (matching program's seed logic)
3. **Prepare transaction with Anchor client** (Web3.js + Anchor IDL)
4. **Sign via Phantom wallet**
5. **Submit and poll for confirmation** (default: confirmed status)
6. **Cache result in local DB + reflect in UI**

### Program → Off-Chain Flow

- **Indexer service** (planned): Listens to transaction logs, updates PostgreSQL analytics
- **Event emission:** Program uses Anchor `msg!()` for diagnostic logging (not indexed yet)
- **On-demand queries:** Frontend calls `getProgramAccounts()` or `getAccountInfo()` directly

---

## Critical Files Reference

| File | Purpose | Key Patterns |
|------|---------|--------------|
| `programs/asset-registry/src/lib.rs` | Core smart contract logic | 5 instructions, PDA derivation, event emission |
| `programs/asset-registry/src/accounts.rs` | Account & error definitions | AssetStatus enum, string validation constants |
| `programs/asset-registry/src/events.rs` | Event emission | 5 events for off-chain tracking |
| `programs/asset-registry/src/instructions.rs` | Instruction handlers | Owner-only access control, circular buffer |
| `tests/asset-registry.ts` | Integration test suite | 8 test cases, account setup, state verification |
| `infra/deploy.sh` | Deployment script | Multi-network support (localnet/devnet/testnet) |
| `app/api/assets/route.ts` | Asset CRUD endpoint | Caching, validation, mock responses |
| `app/api/maintenance-logs/route.ts` | Maintenance log endpoint | Query filtering, error handling |
| `app/components/RegisterAssetForm.tsx` | Registration form | Form validation, API calls |
| `app/components/AssetList.tsx` | Asset listing | Pagination, status badges, real-time fetch |
| `app/dashboard/page.tsx` | Main dashboard | Layout, component composition |
| `Anchor.toml` | Program configuration | Network cluster, RPC URL, program IDs |
| `Solana Asset MVP.md` | MVP scope & requirements | Feature prioritization, acceptance criteria |
| `5W1H.md` | Project requirements | Timeline, success metrics, data models |
| `IMPLEMENTATION_ROADMAP.md` | Technical roadmap | Bottlenecks, library recommendations, actions |
| `IMPLEMENTATION_SUMMARY.md` | Delivery summary | All files created, status, next steps |
| `QUICK_REFERENCE.md` | Developer quick guide | Commands, troubleshooting, checklist

---

## Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "PDA not owned by program" | Account derived with mismatched seeds | Verify seed order/format matches program; use `findProgramAddressSync` consistently |
| "Token account is not owned by user" | Associated token account created with wrong authority | Use `getAssociatedTokenAddress` with correct owner pubkey |
| "Account already in use" | Attempting to recreate initialized account | Check if account exists first (as in `initialize.ts`) |
| "Insufficient lamports" | Transaction fee + account rent exceeds wallet balance | Airdrop more SOL to test wallet; devnet faucet available |
| "Instruction not found" | IDL out of sync with deployed program | Rebuild program (`yarn build-program`), redeploy, update IDL |

---

## Testing Checklist for New Features

Before submitting changes:

1. **Unit test** in `tests/asset-manager.ts` — covers happy path + error cases
2. **PDA derivation** — confirm seed logic matches program (byte order, buffer format)
3. **Account size** — validate space allocation prevents "account too small" errors
4. **Signer requirements** — ensure all necessary keypair signers included in `.signers([...])` 
5. **Rent-exemption** — payer account has enough lamports for account creation + tx fee
6. **Off-chain integration** — if adding new on-chain data, plan IPFS/cache strategy

---

## Getting Productive Quickly

1. **Understand the hybrid model:** On-chain = immutable asset references + status; IPFS = mutable details
2. **Familiarize PDA seeds:** Every account is derived; no hardcoded addresses
3. **Review test suite:** `tests/asset-manager.ts` shows all 6 instructions + expected behavior
4. **Try the workflow:** Build → test locally → optional devnet deploy → inspect logs
5. **Reference the 5W1H:** MVP prioritizes simplicity (free basic tier, 4 core features, SMB focus)
6. **Know the deadline:** MVP demo Oct 23-25; ≥80% core flows must pass; collect tx signatures + video proof

When stuck, check architecture diagram in `docs/architecture-diagram.md` for data flows.
