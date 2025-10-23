#!/bin/bash
# Deploy Solana Asset Manager to Devnet or Localhost

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CLUSTER="${1:-devnet}"
PROGRAM_ID="9Vv8pXNcSPUUXvZwWM9FGYbzat4V1m9AV5fZz4Br8KxE"

echo -e "${YELLOW}=== Solana Asset Manager Deployment ===${NC}"
echo "Target: $CLUSTER"
echo "Program ID: $PROGRAM_ID"
echo ""

# Step 1: Ensure binary is built
echo -e "${YELLOW}[1/5] Checking smart contract binary...${NC}"
if [ ! -f "target/sbpf-solana-solana/release/asset_manager.so" ]; then
    echo -e "${RED}Error: Smart contract not built. Run 'cargo build-sbf' first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Binary found ($(du -h target/sbpf-solana-solana/release/asset_manager.so | cut -f1))${NC}"

# Step 2: Verify IDL
echo -e "${YELLOW}[2/5] Checking IDL...${NC}"
if [ ! -f "target/idl/asset_manager.json" ]; then
    echo -e "${RED}Error: IDL not generated. Run 'anchor build' first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ IDL found${NC}"

# Step 3: Configure cluster
echo -e "${YELLOW}[3/5] Configuring Solana CLI for $CLUSTER...${NC}"
if [ "$CLUSTER" = "localhost" ]; then
    solana config set --url http://localhost:8899 > /dev/null
    echo -e "${GREEN}✓ Configured for localhost${NC}"
else
    solana config set --url "https://api.${CLUSTER}.solana.com" > /dev/null
    echo -e "${GREEN}✓ Configured for $CLUSTER${NC}"
fi

# Step 4: Check wallet funding
echo -e "${YELLOW}[4/5] Checking wallet balance...${NC}"
BALANCE=$(solana balance 2>/dev/null || echo "0")
if [ "$BALANCE" = "0" ]; then
    echo -e "${YELLOW}⚠ Warning: Wallet has no SOL${NC}"
    echo -e "${YELLOW}  To deploy, you need at least 2.5 SOL${NC}"
    if [ "$CLUSTER" = "devnet" ]; then
        echo -e "${YELLOW}  Get SOL: solana airdrop 5 --url devnet${NC}"
        echo -e "${YELLOW}  Or visit: https://faucet.solana.com${NC}"
    elif [ "$CLUSTER" = "localhost" ]; then
        echo -e "${YELLOW}  Get SOL: solana airdrop 100${NC}"
    fi
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Balance: $BALANCE SOL${NC}"
fi

# Step 5: Deploy
echo -e "${YELLOW}[5/5] Deploying to $CLUSTER...${NC}"
anchor deploy \
    --program-name asset_manager \
    --provider.cluster "$CLUSTER" \
    2>&1 | tail -20

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Program deployed:"
echo "  ID: $PROGRAM_ID"
echo "  Cluster: $CLUSTER"
echo ""
if [ "$CLUSTER" = "devnet" ]; then
    echo "View on Solscan:"
    echo "  https://solscan.io/account/$PROGRAM_ID?cluster=devnet"
    echo ""
    echo "Next steps:"
    echo "  1. Update NEXT_PUBLIC_PROGRAM_ID in .env.local"
    echo "  2. Update Anchor.toml [programs.devnet]"
    echo "  3. Run: npm run dev"
fi

if [ "$CLUSTER" = "localhost" ]; then
    echo "View transactions:"
    echo "  solana logs $PROGRAM_ID"
    echo ""
    echo "Run tests:"
    echo "  anchor test --provider.cluster localhost"
fi
