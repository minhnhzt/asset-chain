# Using Helius RPC for Devnet Testing

## Overview

Helius provides a high-performance RPC endpoint for Solana that includes:
- ✅ Higher rate limits than public devnet RPC
- ✅ Enhanced transaction APIs
- ✅ Webhooks support
- ✅ DAS (Digital Asset Standard) API
- ✅ Better reliability and uptime

This guide shows how to use Helius to run tests on devnet without hitting rate limits.

---

## Step 1: Get Helius API Key

### Free Tier (Sufficient for Testing)
1. Visit https://dashboard.helius.dev
2. Sign up for free account
3. Create a new project
4. Copy your API key

**Free Tier Includes:**
- 100,000 requests/day
- Devnet access
- Basic RPC methods
- Sufficient for all MVP testing needs

### Pro Tier (Optional)
- $20/month
- 1,000,000 requests/day
- Priority support
- Enhanced APIs

---

## Step 2: Configure Environment

### Option A: Export Environment Variable (Recommended)

```bash
# Set your Helius API key
export HELIUS_API_KEY='your-api-key-here'

# Verify it's set
echo $HELIUS_API_KEY
```

### Option B: Update .env.devnet File

Edit `.env.devnet` and replace `YOUR_HELIUS_API_KEY`:

```env
# Network Configuration (Devnet with Helius)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_ACTUAL_API_KEY
NEXT_PUBLIC_SOLANA_WS_URL=wss://devnet.helius-rpc.com/?api-key=YOUR_ACTUAL_API_KEY

# Helius API Configuration
HELIUS_API_KEY=YOUR_ACTUAL_API_KEY
```

---

## Step 3: Run Tests with Helius

### Automated Test Script

```bash
# Export API key first
export HELIUS_API_KEY='your-api-key-here'

# Run all tests
./test-devnet-helius.sh

# Skip build (if already built)
./test-devnet-helius.sh --skip-build

# Skip deployment (if already deployed)
./test-devnet-helius.sh --skip-build --skip-deploy

# Custom timeout
./test-devnet-helius.sh --timeout 600
```

### Manual Test Execution

```bash
# Set environment
export HELIUS_API_KEY='your-api-key-here'
export ANCHOR_PROVIDER_URL="https://devnet.helius-rpc.com/?api-key=$HELIUS_API_KEY"
export ANCHOR_WALLET="$HOME/.config/solana/id.json"

# Run tests
yarn run ts-mocha -p ./tsconfig.test.json -t 1000000 'tests/**/*.ts'
```

---

## Step 4: Update Solana CLI to Use Helius

```bash
# Configure Solana CLI
solana config set --url "https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY"

# Verify configuration
solana config get

# Test connection
solana balance
```

---

## Step 5: Frontend Integration

### Update Next.js Configuration

```typescript
// lib/solana-config.ts

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY;

export const getRpcEndpoint = () => {
  if (process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' && HELIUS_API_KEY) {
    return `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  }
  
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
};

export const connection = new Connection(getRpcEndpoint(), 'confirmed');
```

### Environment Variables

```env
# .env.local for development
HELIUS_API_KEY=your-api-key-here
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

---

## Expected Test Results with Helius

### Before (Public Devnet RPC)
```
❌ Error: 429 Too Many Requests
❌ Airdrop request failed
❌ Rate limit reached
```

### After (Helius RPC)
```
✅ 36 tests passing
✅ 7 tests pending
✅ All core flows working
✅ No rate limit issues
```

---

## Helius RPC Benefits

| Feature | Public RPC | Helius Free | Helius Pro |
|---------|-----------|-------------|------------|
| Requests/day | ~2,000 | 100,000 | 1,000,000 |
| Rate limit | Strict | Generous | Very High |
| Uptime | 95% | 99.9% | 99.99% |
| Support | None | Community | Priority |
| Webhooks | No | Yes | Yes |
| DAS API | No | Yes | Yes |
| Cost | Free | Free | $20/month |

---

## Troubleshooting

### Issue: "Invalid API key"

**Solution:**
```bash
# Verify API key format (should be alphanumeric)
echo $HELIUS_API_KEY

# Check for extra spaces or quotes
export HELIUS_API_KEY=$(echo "$HELIUS_API_KEY" | tr -d ' ')
```

### Issue: Still getting 429 errors

**Possible causes:**
1. API key not properly set
2. Using public RPC instead of Helius
3. Free tier limit exceeded (100k requests/day)

**Solution:**
```bash
# Verify you're using Helius
echo $ANCHOR_PROVIDER_URL
# Should show: https://devnet.helius-rpc.com/?api-key=...

# Check dashboard for usage
# Visit: https://dashboard.helius.dev
```

### Issue: "Connection timeout"

**Solution:**
```bash
# Try ping test
curl "https://devnet.helius-rpc.com/?api-key=$HELIUS_API_KEY" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Should return: {"jsonrpc":"2.0","result":"ok","id":1}
```

---

## Alternative RPC Providers

If Helius doesn't work, try these alternatives:

### QuickNode
- URL: `https://YOUR_NAME.solana-devnet.quiknode.pro/YOUR_TOKEN/`
- Free tier: 100,000 requests/month
- Signup: https://www.quicknode.com

### Alchemy
- URL: `https://solana-devnet.g.alchemy.com/v2/YOUR_API_KEY`
- Free tier: 300M requests/month
- Signup: https://www.alchemy.com/solana

### Ankr
- URL: `https://rpc.ankr.com/solana_devnet`
- Public endpoint (rate limited)
- No signup required

---

## Testing Strategy with Helius

### Recommended Approach

1. **Local Development**: Use localnet (no rate limits)
   ```bash
   anchor test  # Full automated test suite
   ```

2. **Integration Testing**: Use Helius devnet (high limits)
   ```bash
   ./test-devnet-helius.sh  # Full test suite on devnet
   ```

3. **Production**: Deploy to mainnet with Helius Pro
   ```bash
   # Mainnet testing with real SOL
   ```

---

## Cost Analysis

### Testing Costs

| Scenario | Requests | Cost with Public RPC | Cost with Helius |
|----------|----------|---------------------|------------------|
| Single test run (36 tests) | ~500 | ❌ Rate limited | ✅ Free |
| 10 test runs | ~5,000 | ❌ Rate limited | ✅ Free |
| Daily CI/CD (100 runs) | ~50,000 | ❌ Impossible | ✅ Free |
| Heavy development (1000 runs/day) | ~500,000 | ❌ Impossible | 💰 $20/month |

**Recommendation**: Use Helius Free tier for MVP (sufficient for 100k+ tests)

---

## Security Best Practices

### ⚠️ Never Commit API Keys

```bash
# Add to .gitignore
echo ".env.devnet" >> .gitignore
echo ".env.local" >> .gitignore

# Use environment variables instead
export HELIUS_API_KEY='...'
```

### ✅ Use Different Keys

- **Development**: Personal API key
- **CI/CD**: Team/organization key
- **Production**: Separate production key with monitoring

### ✅ Rotate Keys Regularly

- Generate new key every 30-90 days
- Revoke old keys in Helius dashboard
- Update environment variables

---

## Quick Start Commands

```bash
# 1. Get your Helius API key from https://dashboard.helius.dev

# 2. Export it
export HELIUS_API_KEY='your-api-key-here'

# 3. Run tests
./test-devnet-helius.sh --skip-build --skip-deploy

# 4. (Optional) Make it permanent
echo 'export HELIUS_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

---

## Summary

✅ **Helius solves the rate limit problem completely**
✅ **Free tier is sufficient for all MVP testing**
✅ **Setup takes less than 5 minutes**
✅ **Works with existing test suite (no code changes)**
✅ **Recommended for all devnet testing**

**Next Steps:**
1. Get Helius API key
2. Export `HELIUS_API_KEY` environment variable
3. Run `./test-devnet-helius.sh`
4. Enjoy unlimited devnet testing! 🎉

---

**Documentation Last Updated**: October 28, 2025
