# Phase 2: Deployment Guide

**Smart Contract Program ID:** (To be assigned after deployment)  
**Target Network:** Solana Devnet  
**Status:** Ready for Deployment  

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Add to PATH
export PATH="/home/USER/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
solana --version
anchor --version
```

---

## 📋 Deployment Steps

### Step 1: Local Build & Test

```bash
# Navigate to project
cd /home/minh/projects/my-solana-app

# Build the program
yarn build-program

# Check build output
ls -la programs/asset-manager/target/sbpf-solana-solana/release/

# Start local validator (in separate terminal)
yarn localnet

# Run tests
yarn test-program
```

### Step 2: Generate Program ID

```bash
# Generate new keypair for program
solana-keygen new -o programs/asset-manager/target/program-id.json

# Get the public key (this is your PROGRAM_ID)
solana-keygen pubkey programs/asset-manager/target/program-id.json
# Output: ProofProofProofProofProofProofProofProofProofProof1111111
```

### Step 3: Update Program ID

```bash
# 1. Update declare_id! in src/multisig_proofs.rs
cat > programs/asset-manager/src/multisig_proofs.rs << 'EOF'
declare_id!("YOUR_NEW_PROGRAM_ID");
EOF

# 2. Update Anchor.toml
[programs.devnet]
multisig_proofs = "YOUR_NEW_PROGRAM_ID"

# 3. Update IDL location (if needed)
[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

### Step 4: Configure Solana CLI

```bash
# Set devnet as cluster
solana config set --url https://api.devnet.solana.com

# Verify
solana config get

# Output:
# Config File: /home/USER/.config/solana/cli/config.yml
# RPC URL: https://api.devnet.solana.com
# WebSocket URL: wss://api.devnet.solana.com/
# Keypair Path: /home/USER/.config/solana/id.json
# Commitment: confirmed
```

### Step 5: Fund Your Wallet

```bash
# Check balance
solana balance

# Get airdrop (devnet only - takes ~30 seconds)
solana airdrop 2
solana airdrop 2
solana airdrop 2

# Check new balance
solana balance
# You need at least 0.5 SOL for deployment
```

### Step 6: Deploy to Devnet

```bash
# Deploy the program
anchor deploy --provider.cluster devnet

# Output example:
# Deploying workspace: /home/minh/projects/my-solana-app
# Upgrade authority: 5vE3JP3f...
# Deployed program: ProofProofProof...
# Program ID: ProofProofProof...
```

---

## ✅ Verification

### Verify Program on Chain

```bash
# Check program on devnet
solana program show ProofProofProof... --url devnet

# Output should show:
# Program Id: ProofProofProof...
# Owner: BPFLoaderUpgradeab...
# ProgramData Address: ...
# Authority: 5vE3JP3f...
# Data len: (size in bytes)
```

### Verify Program on Explorer

```
https://explorer.solana.com/address/{PROGRAM_ID}?cluster=devnet
```

### Fetch and Verify IDL

```bash
# Fetch IDL from chain
anchor idl fetch ProofProofProof... --provider.cluster devnet

# Save to file
anchor idl fetch ProofProofProof... -o target/idl/multisig_proofs.json --provider.cluster devnet
```

---

## 🧪 Test Deployment

### Run Tests Against Devnet

```bash
# Update Anchor.toml to use devnet
[provider]
cluster = "devnet"

# Run tests against devnet
yarn test-program

# Tests will:
# 1. Create accounts on devnet
# 2. Call instructions
# 3. Verify state changes
```

### Manual Testing with CLI

```bash
# Test recording a proof
anchor run record-proof

# Test verifying a proof
anchor run verify-proof

# View events
solana logs ProofProofProof... --url devnet | grep -i "approved\|verified"
```

---

## 📝 Anchor.toml Configuration

```toml
[toolchain]

[features]
seeds = false
init-if-needed = false

[programs.devnet]
multisig_proofs = "ProofProofProofProofProofProofProofProofProofProof1111111"

[programs.localnet]
multisig_proofs = "Fg6PaFpoGXkYsLMsmcf53eeqgGSYq3ErGQEnWQW368m"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn mocha tests/ --require ts-node/register"
record-proof = "ts-node scripts/record-proof.ts"
verify-proof = "ts-node scripts/verify-proof.ts"
```

---

## 🔄 Upgrade Program

### If You Need to Update the Program

```bash
# 1. Make changes to source code
vim programs/asset-manager/src/multisig_proofs.rs

# 2. Build
yarn build-program

# 3. Deploy upgrade
anchor deploy --provider.cluster devnet

# Same PROGRAM_ID, updated bytecode
```

---

## 🛠️ Troubleshooting

### "Insufficient SOL"

```bash
# Get more airdrops (max 5 per day)
solana airdrop 2
solana airdrop 2
solana airdrop 2
```

### "Program not found"

```bash
# Verify program ID is correct
solana program show {PROGRAM_ID} --url devnet

# If not found, re-deploy with correct ID
```

### "Invalid data length"

```bash
# Rebuild and redeploy
yarn build-program
anchor deploy --provider.cluster devnet
```

### "Account already exists"

```bash
# Create with different request_id
# Or use different owner keypair
```

---

## 📊 Deployment Checklist

- [ ] Rust and Solana CLI installed
- [ ] Program builds without errors
- [ ] Tests pass locally
- [ ] Program ID generated
- [ ] `multisig_proofs.rs` updated with Program ID
- [ ] Anchor.toml configured for devnet
- [ ] Wallet funded (>0.5 SOL)
- [ ] Solana CLI set to devnet
- [ ] Program deployed
- [ ] Program verified on-chain
- [ ] IDL fetched from chain
- [ ] Tests pass on devnet
- [ ] Logs show ApprovalProofRecorded events

---

## 🎯 Next Steps

### After Successful Deployment

1. **Document Program ID**
   - Save in `.env.devnet`
   - Update frontend config

2. **Update Frontend**
   - Update API routes to call smart contract
   - Replace mock blockchain with real transactions
   - Update program IDL in frontend

3. **Integration Testing**
   - Test full flow: create → approve → anchor → verify
   - Test with real Web3.js client
   - Verify events on chain

---

## 📚 Resources

### Solana Documentation
- https://docs.solana.com/
- https://docs.rs/anchor-lang/

### Explorer
- Devnet: https://explorer.solana.com/?cluster=devnet
- Program Logs: `solana logs {PROGRAM_ID} --url devnet`

### CLI Reference
- `solana program` - Program commands
- `solana account` - Account queries
- `anchor deploy` - Deploy program

---

## ⏱️ Deployment Timeline

```
Preparation:           5 minutes
Local Testing:         10 minutes
Devnet Airdrop:        1-2 minutes
Deployment:            2-3 minutes
Verification:          1-2 minutes
─────────────────────────────────
Total:                 ~20 minutes
```

---

## ✅ Status

```
╔════════════════════════════════════════════╗
║   Deployment Guide: ✅ READY              ║
║                                            ║
║   Steps documented                         ║
║   Checklist created                        ║
║   Troubleshooting guide provided           ║
║                                            ║
║   Ready to deploy to devnet                ║
╚════════════════════════════════════════════╝
```

**Next Command:**
```bash
# When ready to deploy
anchor deploy --provider.cluster devnet
```

