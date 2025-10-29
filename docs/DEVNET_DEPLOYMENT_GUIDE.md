# Devnet Deployment Guide

## Overview

This guide covers deploying the Asset Management smart contracts to Solana Devnet for testing and demonstration purposes.

## Prerequisites

- Solana CLI configured for devnet
- Wallet with sufficient SOL for deployment (~4 SOL total)
- Anchor CLI 0.32.1
- Built programs (run `anchor build` first)

## Deployment Costs (Approximate)

| Program | Size | Deployment Cost |
|---------|------|----------------|
| asset_lending | ~400 KB | ~3.4 SOL |
| asset_manager | ~150 KB | ~1.2 SOL |
| asset_registry | ~100 KB | ~0.8 SOL |
| **Total** | ~650 KB | **~5.4 SOL** |

## Step-by-Step Deployment

### 1. Configure Solana CLI for Devnet

```bash
# Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# Verify configuration
solana config get

# Check balance
solana balance
```

### 2. Fund Wallet from Faucet

**Option A: CLI Faucet (2 SOL per request, rate-limited)**
```bash
solana airdrop 2

# Wait 30 seconds between requests due to rate limits
sleep 30
solana airdrop 2
```

**Option B: Web Faucets (Higher limits)**
- https://faucet.solana.com - Official faucet (5 SOL/day)
- https://solfaucet.com - Community faucet
- https://faucet.quicknode.com/solana/devnet - QuickNode faucet

**Option C: Discord Faucet (Best for large amounts)**
1. Join Solana Discord: https://discord.gg/solana
2. Go to #devnet-faucet channel
3. Use command: `/airdrop <your-wallet-address>`
4. Receive up to 5 SOL per request

### 3. Update Anchor.toml

Ensure `Anchor.toml` is configured for devnet:

```toml
[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"
```

### 4. Build Programs

```bash
# Build all programs
anchor build

# Verify build artifacts
ls -lh target/deploy/*.so
```

### 5. Deploy to Devnet

**Option A: Deploy All Programs (Recommended)**
```bash
anchor deploy --provider.cluster devnet
```

**Option B: Deploy Individual Programs (If funding is limited)**
```bash
# Deploy smallest program first (asset_registry)
solana program deploy target/deploy/asset_registry.so \
  --program-id target/deploy/asset_registry-keypair.json \
  -u devnet

# Deploy asset_manager
solana program deploy target/deploy/asset_manager.so \
  --program-id target/deploy/asset_manager-keypair.json \
  -u devnet

# Deploy asset_lending (largest, needs most SOL)
solana program deploy target/deploy/asset_lending.so \
  --program-id target/deploy/asset_lending-keypair.json \
  -u devnet
```

### 6. Verify Deployment

```bash
# Check program accounts
solana program show CdXqQDN1ifc1KpDtm1FaaSihqYrdasBsmfHqP77H9gHW -u devnet
solana program show 99GdmczATUfVdHEPVea3vgLSzyaGEMFJtuDgVUXmufe7 -u devnet
solana program show Fmis8h1QohoXVrWjE98cYgoNZTrCuivRPLXmr2NTw6o3 -u devnet
```

## Deployed Program IDs (Devnet)

| Program | Program ID | Status |
|---------|-----------|--------|
| asset_lending | `CdXqQDN1ifc1KpDtm1FaaSihqYrdasBsmfHqP77H9gHW` | Pending |
| asset_manager | `99GdmczATUfVdHEPVea3vgLSzyaGEMFJtuDgVUXmufe7` | Pending |
| asset_registry | `Fmis8h1QohoXVrWjE98cYgoNZTrCuivRPLXmr2NTw6o3` | Pending |

> **Note**: Update status to "✅ Deployed" after successful deployment

## Post-Deployment Testing

### 1. Initialize Global Config (Required First)

```bash
# Run initialization script
anchor run initialize --provider.cluster devnet
```

### 2. Run Test Suite on Devnet

```bash
# Update test configuration to use devnet
anchor test --skip-build --provider.cluster devnet
```

### 3. Manual Testing with Solana Explorer

Visit Solana Explorer (devnet mode):
- https://explorer.solana.com/?cluster=devnet
- Search for program IDs to view transactions

### 4. Frontend Integration Testing

Update `.env.local` in Next.js app:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_ASSET_LENDING_PROGRAM=CdXqQDN1ifc1KpDtm1FaaSihqYrdasBsmfHqP77H9gHW
NEXT_PUBLIC_ASSET_MANAGER_PROGRAM=99GdmczATUfVdHEPVea3vgLSzyaGEMFJtuDgVUXmufe7
NEXT_PUBLIC_ASSET_REGISTRY_PROGRAM=Fmis8h1QohoXVrWjE98cYgoNZTrCuivRPLXmr2NTw6o3
```

## Troubleshooting

### Issue: Insufficient Funds

**Symptoms:**
```
Error: Account has insufficient funds for spend (X SOL) + fee (Y SOL)
```

**Solutions:**
1. Request more SOL from Discord faucet
2. Deploy programs individually (smallest first)
3. Use buffer account to split deployment:
   ```bash
   # Create buffer account
   solana program write-buffer target/deploy/asset_lending.so -u devnet
   
   # Deploy from buffer (cheaper, can split into multiple tx)
   solana program deploy --buffer <BUFFER_ADDRESS> \
     --program-id target/deploy/asset_lending-keypair.json -u devnet
   ```

### Issue: Rate Limit Reached

**Symptoms:**
```
Error: airdrop request failed. This can happen when the rate limit is reached.
```

**Solutions:**
1. Wait 5-10 minutes before retrying
2. Use alternative faucets (Discord, web faucets)
3. Use different wallet temporarily

### Issue: Transaction Timeout

**Symptoms:**
```
Error: Transaction simulation failed: Blockhash not found
```

**Solutions:**
1. Retry deployment command
2. Use faster RPC endpoint:
   ```bash
   solana config set --url https://rpc.ankr.com/solana_devnet
   ```
3. Check devnet status: https://status.solana.com

### Issue: Program Already Deployed

**Symptoms:**
```
Error: Program is not upgradeable
```

**Solutions:**
1. Use `anchor upgrade` instead of `anchor deploy`
2. Verify upgrade authority:
   ```bash
   solana program show <PROGRAM_ID> -u devnet
   ```

## Cost Optimization Tips

### 1. Reduce Program Size

```bash
# Strip debug symbols
cargo build-sbf --release -- --strip all

# Use size optimization
RUSTFLAGS="-C opt-level=z" anchor build
```

### 2. Use Upgrade Instead of Redeploy

If program already exists on devnet:
```bash
anchor upgrade target/deploy/asset_lending.so \
  --program-id CdXqQDN1ifc1KpDtm1FaaSihqYrdasBsmfHqP77H9gHW \
  --provider.cluster devnet
```

Upgrade costs ~90% less than initial deployment.

### 3. Close Unused Programs

If testing multiple versions:
```bash
# Close old program to recover rent
solana program close <OLD_PROGRAM_ID> -u devnet
```

## Monitoring Deployment

### Real-time Logs

```bash
# Watch transaction logs
solana logs --url devnet | grep -i "Program CdXq"
```

### Check Program Size

```bash
# View deployed program size
solana program show CdXqQDN1ifc1KpDtm1FaaSihqYrdasBsmfHqP77H9gHW -u devnet \
  | grep "Data Length"
```

### Verify Upgrade Authority

```bash
# Ensure you can upgrade later
solana program show CdXqQDN1ifc1KpDtm1FaaSihqYrdasBsmfHqP77H9gHW -u devnet \
  | grep "Authority"
```

## Expected Results

After successful deployment, you should see:

```
✅ Deploying cluster: https://api.devnet.solana.com
✅ Upgrade authority: /home/user/.config/solana/id.json
✅ Deploying program "asset_lending"...
   Program Id: CdXqQDN1ifc1KpDtm1FaaSihqYrdasBsmfHqP77H9gHW
   
✅ Deploying program "asset_manager"...
   Program Id: 99GdmczATUfVdHEPVea3vgLSzyaGEMFJtuDgVUXmufe7
   
✅ Deploying program "asset_registry"...
   Program Id: Fmis8h1QohoXVrWjE98cYgoNZTrCuivRPLXmr2NTw6o3

✅ Deploy success
```

## Next Steps

After successful devnet deployment:

1. ✅ **Initialize Global Config**
   ```bash
   anchor run initialize --provider.cluster devnet
   ```

2. ✅ **Run Integration Tests**
   ```bash
   anchor test --skip-build --provider.cluster devnet
   ```

3. ✅ **Update Frontend Config**
   - Update `.env.local` with devnet program IDs
   - Test wallet connection with Phantom
   - Verify transactions on Solana Explorer

4. ✅ **Document Deployment**
   - Record program IDs in `DEPLOYMENT_ADDRESSES.md`
   - Take screenshots for demo
   - Collect sample transaction signatures

5. ✅ **Performance Validation**
   - Measure transaction confirmation time (< 5s target)
   - Test asset listing performance (< 2s for 100 assets)
   - Verify M-of-N consensus flow (2/2 approvals)

## Reference Links

- **Solana Devnet Faucet**: https://faucet.solana.com
- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet
- **Solana Status**: https://status.solana.com
- **Anchor Docs**: https://www.anchor-lang.com/docs/cli
- **Solana CLI Reference**: https://docs.solana.com/cli

## Alternative: Deploy via Solana Playground

If local deployment fails due to funding issues:

1. Visit https://beta.solpg.io
2. Import project files
3. Connect Phantom wallet with devnet
4. Use built-in deployment (automatic funding)
5. Export program IDs for local testing

## Deployment Checklist

- [ ] Solana CLI configured for devnet
- [ ] Wallet funded with 5+ SOL
- [ ] Anchor.toml updated to devnet
- [ ] Programs built successfully
- [ ] asset_lending deployed
- [ ] asset_manager deployed
- [ ] asset_registry deployed
- [ ] Global config initialized
- [ ] Test suite passes on devnet
- [ ] Frontend integrated with devnet
- [ ] Deployment documented

---

**Last Updated**: October 28, 2025  
**Deployment Status**: In Progress  
**Estimated Completion Time**: 15-30 minutes (depending on faucet availability)
