#!/bin/bash

# Asset Registry Deployment Script
# Deploys the Anchor program to Solana devnet

set -e

echo "🚀 Solana Asset Registry Deployment Script"
echo "==========================================="

# Check prerequisites
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Install from https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Install from https://www.anchor-lang.com/docs/installation"
    exit 1
fi

if ! command -v rustc &> /dev/null; then
    echo "❌ Rust not found. Install from https://rustup.rs/"
    exit 1
fi

echo "✅ All prerequisites installed"

# Determine network
NETWORK="${1:-devnet}"
case $NETWORK in
    localnet)
        CLUSTER="http://127.0.0.1:8899"
        echo "📍 Target: Localnet"
        ;;
    devnet)
        CLUSTER="https://api.devnet.solana.com"
        echo "📍 Target: Devnet"
        ;;
    testnet)
        CLUSTER="https://api.testnet.solana.com"
        echo "📍 Target: Testnet"
        ;;
    mainnet)
        CLUSTER="https://api.mainnet-beta.solana.com"
        echo "📍 Target: Mainnet"
        ;;
    *)
        echo "❌ Invalid network: $NETWORK"
        echo "Usage: ./deploy.sh [localnet|devnet|testnet|mainnet]"
        exit 1
        ;;
esac

# Set RPC endpoint
solana config set --url "$CLUSTER"

# Get current keypair
KEYPAIR=$(solana config get keypair)
echo "💼 Deployer: $KEYPAIR"

# Check wallet balance
BALANCE=$(solana balance | awk '{print $1}')
echo "💰 Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 0.5" | bc -l) )); then
    echo "⚠️  Low balance! Recommended: >= 0.5 SOL"
    if [ "$NETWORK" = "devnet" ]; then
        echo "   Run: solana airdrop 2"
    fi
fi

# Build program
echo ""
echo "🔨 Building Anchor program..."
cd programs/asset-registry
anchor build
cd ../..

if [ ! -f "programs/asset-registry/target/sbpf-solana-solana/release/asset_registry.so" ]; then
    echo "❌ Build failed: program binary not found"
    exit 1
fi

echo "✅ Build successful"

# Deploy program
echo ""
echo "📤 Deploying program..."
anchor deploy --provider.cluster "$CLUSTER"

# Extract program ID
PROGRAM_ID=$(solana address -k programs/asset-registry/target/keys/asset_registry-keypair.json)
echo ""
echo "✅ Deployment successful!"
echo "📌 Program ID: $PROGRAM_ID"
echo ""

# Update Anchor.toml
echo "🔧 Updating Anchor.toml..."
if [ "$NETWORK" = "localnet" ]; then
    NETWORK_KEY="localnet"
elif [ "$NETWORK" = "devnet" ]; then
    NETWORK_KEY="devnet"
else
    NETWORK_KEY="$NETWORK"
fi

# Backup Anchor.toml
cp Anchor.toml Anchor.toml.backup

# Update program ID (platform-dependent)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/asset_registry = .*/asset_registry = \"$PROGRAM_ID\"/" Anchor.toml
else
    # Linux
    sed -i "s/asset_registry = .*/asset_registry = \"$PROGRAM_ID\"/" Anchor.toml
fi

echo "✅ Updated Anchor.toml"

# Generate IDL
echo ""
echo "📋 Generating IDL..."
anchor idl init -f target/idl/asset_registry.json "$PROGRAM_ID" \
    --provider.cluster "$CLUSTER" 2>/dev/null || echo "⚠️  IDL generation (may retry later)"

# Print deployment info
echo ""
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "============================================"
echo "Network:    $NETWORK"
echo "Cluster:    $CLUSTER"
echo "Program ID: $PROGRAM_ID"
echo "Deployer:   $KEYPAIR"
echo ""
echo "📚 Next Steps:"
echo "1. Save Program ID: $PROGRAM_ID"
echo "2. Update .env.local with NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID"
echo "3. Run tests: yarn run test-program"
echo "4. Start frontend: yarn run dev"
echo ""
echo "🧪 Run tests on deployed program:"
echo "   ANCHOR_PROVIDER_URL=$CLUSTER yarn run test-program"
echo ""
