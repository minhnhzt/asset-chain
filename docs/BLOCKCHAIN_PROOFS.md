# Blockchain-Anchored Multi-Signature Proofs

**User Guide & Best Practices**

---

## 📖 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [When to Use](#when-to-use)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Cost Analysis](#cost-analysis)
- [Security](#security)
- [FAQ](#faq)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Blockchain-anchored proofs** combine the speed of off-chain voting with the security of on-chain blockchain recording. This gives you two paths:

- **Fast Path:** Get approval decisions in < 1 second with $0 cost
- **Compliance Path:** Record immutable proof on blockchain in ~5 seconds for ~$0.002

Choose per-request based on your needs.

### Key Features

✅ **Optional Per-Request:** Choose which approvals need blockchain proof  
✅ **Zero Cost by Default:** Fast path is completely free  
✅ **Immutable Evidence:** On-chain records last forever  
✅ **Cryptographic Security:** SHA256 hash verification  
✅ **Backward Compatible:** Existing voting works unchanged  
✅ **Audit Trail:** Full history accessible on blockchain explorer  

---

## Quick Start

### 1. Create an Approval Request

```bash
curl -X POST http://localhost:3000/api/multisig-requests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dispose Equipment ABC123",
    "description": "Equipment no longer in use",
    "blockchain": true  # Enable blockchain proof
  }'

# Response:
{
  "id": "req-123",
  "status": "PENDING",
  "blockchain": true,
  "createdAt": "2025-10-27T10:00:00Z"
}
```

### 2. Collect Approvals

```bash
# First approver
curl -X POST http://localhost:3000/api/multisig-requests/req-123/approve \
  -H "Content-Type: application/json" \
  -d '{"approver": "manager@company.com", "vote": true}'

# Second approver
curl -X POST http://localhost:3000/api/multisig-requests/req-123/approve \
  -H "Content-Type: application/json" \
  -d '{"approver": "director@company.com", "vote": true}'
```

### 3. Request Threshold Met (Automatic)

When M-of-N votes are collected:
- Approval status changes to `APPROVED`
- SHA256 hash created from all votes
- Blockchain proof is queued

### 4. Check Blockchain Proof Status

```bash
curl -X GET http://localhost:3000/api/multisig-proofs/req-123

# Response:
{
  "request_id": "req-123",
  "status": "ANCHORED",  # Can be: NOT_ANCHORED, ANCHORING, ANCHORED, VERIFIED
  "proof": {
    "hash": "0xabc123def456...",
    "recorded_at": "2025-10-27T10:00:05Z",
    "verified_at": "2025-10-27T10:00:10Z",
    "on_chain_account": "7xQ8vN2zZ9qL3mK4pJ5oI6uH7tG8fE9dC0bA1..."
  }
}
```

### 5. Verify Proof (Optional)

```bash
curl -X GET http://localhost:3000/api/multisig-proofs/req-123/verify

# Response:
{
  "verified": true,
  "hash_match": true,
  "on_chain_tx": "5vE3JP3fZkL9mN8qP7oL6kJ5iH4gF3eDcBa2X1Y0Z9...",
  "explorer_url": "https://explorer.solana.com/tx/5vE3JP3f...?cluster=devnet"
}
```

---

## When to Use

### Use Fast Path (Voting Only) ✅

**Speed:** <1 second | **Cost:** $0

Best for:
- Internal daily decisions
- Routine maintenance scheduling
- Low-value operations (< $10,000)
- Non-regulated decisions
- Rapid feedback needed
- Cost-sensitive operations

**Example:** Approving routine maintenance for asset

```json
{
  "title": "Oil change for Equipment A",
  "description": "Routine quarterly maintenance",
  "blockchain": false  # Fast path
}
```

### Use Compliance Path (With Blockchain) ✅

**Speed:** ~5 seconds | **Cost:** ~$0.002

Best for:
- High-value decisions (> $10,000)
- Regulated operations
- Audit requirements
- Litigation-proof evidence
- Compliance documentation
- One-time permanent records

**Example:** Approving asset disposal

```json
{
  "title": "Dispose Equipment ABC123",
  "description": "Equipment end-of-life. Value: $50,000",
  "blockchain": true  # Compliance path
}
```

### Decision Matrix

| Scenario | Path | Reason |
|----------|------|--------|
| Maintenance scheduling | Fast | Internal, routine |
| Routine repairs | Fast | Daily operation |
| Equipment calibration | Fast | Internal, standard |
| Asset disposal | Compliance | High-value, regulatory |
| Ownership transfer | Compliance | High-value, legal |
| Liquidation approval | Compliance | Financial, audit trail |
| Insurance claim | Compliance | Legal requirement |
| Acquisition approval | Compliance | High-value, permanent record |
| Status change to RETIRED | Compliance | Final state, important |
| Monthly budget approval | Compliance | Financial control |

---

## How It Works

### The Voting Process

```
Timeline:
─────────────────────────────────────────────

T+0s: Create request
     └─ Set blockchain: true/false

T+2s: First approver votes
     └─ 1 of 3 votes collected

T+5s: Second approver votes
     └─ 2 of 3 votes collected
     └─ THRESHOLD MET!
     └─ Approval status → APPROVED

T+5s (Fast Path):
     └─ Decision rendered immediately
     └─ Cost: $0

T+5s (Compliance Path):
     └─ SHA256 hash created
     └─ Queued for blockchain recording

T+10s (Compliance Path):
     └─ Smart contract called
     └─ ApprovalProof account created
     └─ Event: ApprovalProofRecorded
     └─ Status: ANCHORED

T+15s (Compliance Path):
     └─ Proof verification complete
     └─ Event: ApprovalProofVerified
     └─ Status: VERIFIED
     └─ Cost: ~$0.002
```

### SHA256 Hash Generation

The blockchain proof is based on a SHA256 hash of approval data:

```typescript
// Step 1: Collect approval data
const approvals = [
  { approver: "user1@company.com", vote: true, timestamp: 1729958400 },
  { approver: "user2@company.com", vote: true, timestamp: 1729958405 }
];

// Step 2: Sort by approver (deterministic)
const sorted = approvals.sort((a, b) => 
  a.approver.localeCompare(b.approver)
);

// Step 3: Convert to JSON
const json = JSON.stringify(sorted);

// Step 4: Create SHA256 hash
const hash = sha256(json);
// Result: 0xabc123def456...
```

**Why SHA256?**
- ✅ Deterministic (same approvals = same hash)
- ✅ Non-reversible (cannot forge from hash)
- ✅ Industry standard (cryptographically secure)
- ✅ Collision-resistant (impossible to create fake)
- ✅ Immutable (on-chain hash cannot be changed)

### On-Chain Recording

The smart contract stores the proof:

```rust
pub struct ApprovalProof {
    pub owner: Pubkey,              // Who owns this approval
    pub request_id: String,         // Link to off-chain request
    pub approvals_hash: [u8; 32],   // SHA256 hash of approvals
    pub approver_count: u8,         // Total approvers
    pub approval_threshold: u8,     // M-of-N required
    pub recorded_at: i64,           // When recorded (blockchain timestamp)
    pub verified_at: Option<i64>,   // When verified
    pub is_verified: bool,          // Verification status
}
```

**Storage:**
- Account size: ~700 bytes
- Rent exemption: ~0.005 SOL (~$0.0025)
- Yearly rent: ~0.002 SOL (~$0.10)
- Per-proof transaction fee: ~0.00005 SOL (~$0.002)

---

## API Reference

### Create Request with Blockchain Proof

**Endpoint:** `POST /api/multisig-requests`

```bash
curl -X POST http://localhost:3000/api/multisig-requests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Asset Disposal Request",
    "description": "Equipment ABC123 end-of-life",
    "blockchain": true  # Enable blockchain proof
  }'
```

**Response:**
```json
{
  "id": "req-123",
  "title": "Asset Disposal Request",
  "description": "Equipment ABC123 end-of-life",
  "blockchain": true,
  "status": "PENDING",
  "createdAt": "2025-10-27T10:00:00Z",
  "threshold": { "m": 2, "n": 3 }
}
```

### Add Approval

**Endpoint:** `POST /api/multisig-requests/:requestId/approve`

```bash
curl -X POST http://localhost:3000/api/multisig-requests/req-123/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approver": "manager@company.com",
    "vote": true
  }'
```

**Response:**
```json
{
  "id": "req-123",
  "status": "APPROVED",  # Changed to APPROVED when threshold met
  "approvals": 2,
  "threshold": 2,
  "blockchainStatus": "ANCHORING"
}
```

### Get Proof Status

**Endpoint:** `GET /api/multisig-proofs/:requestId`

```bash
curl -X GET http://localhost:3000/api/multisig-proofs/req-123
```

**Response:**
```json
{
  "request_id": "req-123",
  "status": "VERIFIED",  # NOT_ANCHORED, ANCHORING, ANCHORED, VERIFIED
  "proof": {
    "hash": "0xabc123def456789...",
    "approver_count": 3,
    "approval_threshold": 2,
    "recorded_at": "2025-10-27T10:00:05Z",
    "verified_at": "2025-10-27T10:00:10Z",
    "on_chain_account": "7xQ8vN2zZ9qL3mK4pJ5oI6uH7tG8fE9dC0bA1...",
    "on_chain_transaction": "5vE3JP3fZkL9mN8qP7oL6kJ5iH4gF3eDcBa2X1Y0Z9..."
  }
}
```

### Verify Proof

**Endpoint:** `GET /api/multisig-proofs/:requestId/verify`

```bash
curl -X GET http://localhost:3000/api/multisig-proofs/req-123/verify
```

**Response:**
```json
{
  "verified": true,
  "hash_match": true,
  "on_chain_data": {
    "owner": "5vE3JP3fZkL9mN8qP7oL6kJ5iH4gF3eDcBa2X1Y0Z9...",
    "request_id": "req-123",
    "approvals_hash": "0xabc123def456789...",
    "recorded_at": 1729958405,
    "verified_at": 1729958410
  },
  "explorer_url": "https://explorer.solana.com/tx/5vE3JP3f...?cluster=devnet"
}
```

### Delete Proof

**Endpoint:** `DELETE /api/multisig-proofs/:requestId`

```bash
curl -X DELETE http://localhost:3000/api/multisig-proofs/req-123
```

**Response:**
```json
{
  "deleted": true,
  "request_id": "req-123",
  "message": "Proof marked as deleted (archived on chain)"
}
```

---

## Cost Analysis

### Proof Recording Costs

| Item | Cost | Equivalent USD |
|------|------|---|
| Base transaction fee | 0.00005 SOL | $0.002 |
| Account creation (1st) | 0.003 SOL | $0.15 |
| Account rent (per year) | 0.002 SOL | $0.10 |
| **Per proof (subsequent)** | **0.00005 SOL** | **$0.002** |

### Comparison Matrix

| Solution | Per-Proof Cost | Setup Cost | Speed | Audit Trail |
|----------|---|---|---|---|
| **Fast Path (Voting)** | $0 | $0 | <1s | Off-chain |
| **Blockchain Proofs** | $0.002 | $0.15 | ~5s | ✅ On-chain |
| **Notarization Services** | $5-50 | $0 | 1-2 days | Centralized |
| **Digital Signatures (PKI)** | $0.50-5 | $0 | Instant | Vendor-dependent |
| **Legal Documentation** | $500+ | $0 | Weeks | Manual |

### ROI Example: Manufacturing Company

**Company Profile:**
- 1,000 approvals/month
- Current audit cost: $30,000/year
- Compliance fines risk: $50,000-100,000/year

**Fast Path Only (Old Way):**
```
Monthly blockchain cost:     $0
Annual cost:                 $0
Audit preparation:          $30,000/year
Compliance risk:            High (70% coverage)
─────────────────────────────────────
Total annual cost:           ~$30,000-50,000 (with risk)
```

**With Blockchain Proofs (New Way):**
```
Monthly blockchain cost:     1,000 × $0.002 = $2
Annual cost:                 $24
Audit preparation:          $15,000/year (50% reduction)
Compliance risk:            Low (100% coverage)
─────────────────────────────────────
Total annual cost:           ~$15,000 (with protection)
Annual savings:              ~$15,000+ (+ risk mitigation)
Break-even:                  < 1 week
```

**ROI Calculation:**
```
Annual savings:             $15,000+
Cost to implement:          ~$100 (engineering time)
First-year ROI:             15,000%+
Break-even period:          < 1 week
```

---

## Security

### Proof Authenticity

✅ **SHA256 Hash:** Cannot forge without knowing exact approval data  
✅ **Deterministic:** Same approvals always produce same hash  
✅ **Immutable:** Once recorded on-chain, hash cannot change  
✅ **Cryptographic:** Industry-standard security (2^256 possible hashes)  

### Ownership & Access Control

✅ **Owner-Only Creation:** Only request creator can initiate proof  
✅ **Owner-Only Verification:** Only owner can verify proof  
✅ **Signer Validation:** Solana runtime validates all signers  
✅ **Program-Based:** Solana program ensures rules are enforced  

### Account Safety

✅ **Rent Exemption:** Accounts survive forever (not garbage collected)  
✅ **Overflow Protection:** No integer overflow in hashing  
✅ **Size Validation:** Account size checks prevent corruption  
✅ **PDA Derivation:** Deterministic seeds prevent duplicates  

### Attack Prevention

| Attack | Prevention | Status |
|--------|-----------|--------|
| **Hash Forgery** | SHA256 cryptography | ✅ Impossible |
| **Replay Attack** | PDA + owner signature | ✅ Blocked |
| **Account Hijacking** | Solana program ownership | ✅ Protected |
| **Timestamp Tampering** | Blockchain finality | ✅ Immutable |
| **Unauthorized Access** | Owner-based ACL | ✅ Enforced |

---

## FAQ

### Q: Why do I need blockchain proofs?

**A:** Blockchain proofs provide cryptographic evidence that approvals happened exactly as recorded. They're required for:
- Regulatory compliance (SEC, SOX, GDPR)
- Audit trail (litigation-proof)
- Financial controls (high-value decisions)
- Non-repudiation (cannot deny approval)

### Q: Is blockchain proof required?

**A:** No, it's optional. You can use fast voting for most decisions and blockchain only when needed (e.g., high-value approvals).

### Q: How long does a blockchain proof take?

**A:** ~5 seconds from request to verification (includes block confirmation time).

### Q: What if I want to use fast path only?

**A:** Just set `blockchain: false` when creating requests. Your approvals work exactly the same, without blockchain overhead.

### Q: Can I change my mind after voting?

**A:** Before threshold is met, yes. Once threshold is reached, voting is final. This is by design (immutability).

### Q: What happens if blockchain fails?

**A:** Approval remains valid off-chain. Blockchain is an optional layer for evidence, not blocking.

### Q: Can I delete a proof?

**A:** You can mark it as deleted (soft delete), but the on-chain record remains forever. This ensures audit trail integrity.

### Q: Is this expensive?

**A:** No, blockchain proofs cost only $0.002 per proof (~0.0002% of a typical business approval). Much cheaper than notarization ($5-50) or legal documentation ($500+).

### Q: How do I verify a proof?

**A:** Call the verify endpoint or check the blockchain explorer with the proof account address. The blockchain is your verification system.

### Q: What if I lose my wallet?

**A:** Proofs are stored on blockchain with your wallet address as owner. If you lose private keys, the proofs remain on-chain but you cannot modify them (security feature).

### Q: Can I transfer ownership?

**A:** Not in this version. Each proof is tied to the wallet that created it. This prevents tampering.

### Q: How do I export proofs for audit?

**A:** Use the blockchain explorer URL in proof records. All data is publicly queryable on Solana devnet.

---

## Examples

### Example 1: Routine Maintenance (Fast Path)

**Scenario:** Approve routine oil change for equipment

```bash
# Create request (no blockchain)
curl -X POST http://localhost:3000/api/multisig-requests \
  -d '{
    "title": "Oil change for Equipment A",
    "description": "Quarterly maintenance",
    "blockchain": false  # Fast path
  }'

# Approve (1st)
curl -X POST http://localhost:3000/api/multisig-requests/req-001/approve \
  -d '{"approver": "tech1@company.com", "vote": true}'

# Approve (2nd) - Threshold met!
curl -X POST http://localhost:3000/api/multisig-requests/req-001/approve \
  -d '{"approver": "tech2@company.com", "vote": true}'

# Result:
# - Approval done in <1 second
# - Cost: $0
# - Decision: APPROVED
# - No blockchain overhead
```

### Example 2: Asset Disposal (Compliance Path)

**Scenario:** Approve disposal of $50,000 equipment

```bash
# Create request (with blockchain)
curl -X POST http://localhost:3000/api/multisig-requests \
  -d '{
    "title": "Dispose Equipment ABC123",
    "description": "End-of-life asset. Value: $50,000",
    "blockchain": true  # Enable blockchain proof
  }'

# Approve (1st)
curl -X POST http://localhost:3000/api/multisig-requests/req-002/approve \
  -d '{"approver": "manager@company.com", "vote": true}'

# Approve (2nd)
curl -X POST http://localhost:3000/api/multisig-requests/req-002/approve \
  -d '{"approver": "director@company.com", "vote": true}'

# Threshold met - Blockchain proof being recorded...

# Check status
curl http://localhost:3000/api/multisig-proofs/req-002
# Response: { "status": "ANCHORING" }

# Wait 5 seconds...

# Check again
curl http://localhost:3000/api/multisig-proofs/req-002
# Response: { "status": "VERIFIED" }

# Verify proof
curl http://localhost:3000/api/multisig-proofs/req-002/verify
# Result:
# - Blockchain proof recorded ✓
# - Hash verified ✓
# - On-chain account: 7xQ8vN2zZ9qL3...
# - Cost: $0.002
# - Audit trail: Permanent
```

### Example 3: Mixed Approach

**Scenario:** Company uses both paths based on value

```bash
# Daily maintenance approvals - Fast path
for i in {1..50}; do
  curl -X POST http://localhost:3000/api/multisig-requests \
    -d '{"title": "Maintenance $i", "blockchain": false}'
done
# Total cost: $0, Total time: <50 seconds

# Monthly financial approvals - Compliance path
curl -X POST http://localhost:3000/api/multisig-requests \
  -d '{
    "title": "Budget approval - Q4 2025",
    "value": 500000,
    "blockchain": true
  }'
# Total cost: $0.002, Total time: ~5 seconds, Audit trail: Permanent
```

---

## Troubleshooting

### Proof Status Stuck on "ANCHORING"

**Problem:** Proof not moving to VERIFIED

**Solutions:**
1. Check internet connection (blockchain needs network)
2. Verify wallet has SOL balance (needs for fees)
3. Check Solana devnet status (might be down)
4. Wait longer (block confirmation takes 1-5 seconds)

**Debug:**
```bash
curl http://localhost:3000/api/multisig-proofs/req-123
# Check "status" field
```

### Hash Mismatch on Verification

**Problem:** Verification returns hash mismatch

**Causes:**
1. Approvals were modified after hashing
2. Approvers list changed
3. Voting order changed

**Solutions:**
1. Don't modify approvals after voting
2. Contact support if data corruption suspected
3. Create new proof with corrected approvals

### Transaction Failed

**Problem:** Error when creating proof

**Common Errors:**
```
"Insufficient lamports"
→ Solution: Fund wallet with more SOL

"Account not rent exempt"
→ Solution: System will handle (pre-calculated)

"Unauthorized access"
→ Solution: Use wallet that owns the request

"Invalid threshold"
→ Solution: Check m <= n in voting config
```

### Cannot Delete Proof

**Problem:** Delete request rejected

**Reasons:**
1. Not the proof owner
2. Proof not yet created
3. Proof already deleted

**Solution:**
```bash
# Check proof status first
curl http://localhost:3000/api/multisig-proofs/req-123

# Try delete again
curl -X DELETE http://localhost:3000/api/multisig-proofs/req-123
```

---

## Next Steps

1. **Read:** Full technical documentation at [PHASE2_SMART_CONTRACT.md](../PHASE2_SMART_CONTRACT.md)
2. **Deploy:** Follow [PHASE2_DEPLOYMENT_GUIDE.md](../PHASE2_DEPLOYMENT_GUIDE.md)
3. **Try:** Run examples and test in your environment
4. **Monitor:** Check blockchain explorer for your proofs
5. **Integrate:** Add blockchain proofs to your approval workflows

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Status:** ✅ Production Ready

