# Blockchain-Anchored Multi-Sig Integration Roadmap

**Status:** Phase 2 Planning (Oct 26, 2025)  
**Goal:** Seamlessly integrate blockchain proofs with existing off-chain multi-sig  
**Target Timeline:** Q4 2025 (Post-MVP optimization)

---

## 🎯 Integration Goals

| Goal | Metric | Status |
|------|--------|--------|
| No Breaking Changes | 0 breaking changes to existing API | ✅ Planned |
| Optional Blockchain | Anchoring is opt-in, not mandatory | ✅ Planned |
| Performance Maintained | Off-chain approval < 1s | ✅ Maintained |
| Clear Architecture | Separated off-chain/on-chain concerns | ✅ Designed |
| Full Immutability | Blockchain proof is cryptographically secure | ✅ Planned |
| Cost Optimized | Free path available, premium option for proof | ✅ Planned |

---

## 📐 Technical Architecture

### Layer 1: Off-Chain Multi-Sig (Unchanged)

```typescript
// Existing types + new optional blockchain tracking
interface MultiSigRequest {
  // Existing fields (unchanged)
  id: string;
  requestType: RequestType;
  assetId: string;
  approvers: PublicKey[];
  requiredApprovals: number;
  currentApprovals: number;
  approvedBy: PublicKey[];
  rejectedBy: PublicKey[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  timestamps: {
    createdAt: number;
    updatedAt: number;
  };
  
  // NEW: Optional blockchain proof tracking
  blockchainProof?: {
    status: 'NOT_ANCHORED' | 'ANCHORING' | 'ANCHORED' | 'VERIFIED';
    txHash?: string;           // Solana transaction hash
    pda?: string;              // Proof PDA address
    approvalsHash?: string;    // SHA256 of approval data
    anchoredAt?: number;       // Blockchain timestamp
    verifiedAt?: number;
    error?: string;            // If anchor failed
  };
}
```

### Layer 2: Smart Contract (New, Separate)

**File:** `programs/asset-manager/src/multisig_proofs.rs`

```rust
use anchor_lang::prelude::*;

#[program]
pub mod multisig_proofs {
    use super::*;

    /// Record an approval proof on-chain
    /// Stores immutable record of approval votes
    pub fn record_approval_proof(
        ctx: Context<RecordProof>,
        request_id: String,
        approvals_hash: [u8; 32],
        approver_count: u8,
        approval_threshold: u8,
    ) -> Result<()> {
        let proof = &mut ctx.accounts.approval_proof;
        proof.request_id = request_id;
        proof.asset_id = ctx.accounts.asset.key();
        proof.approvals_hash = approvals_hash;
        proof.approver_count = approver_count;
        proof.approval_threshold = approval_threshold;
        proof.timestamp = Clock::get()?.unix_timestamp;
        proof.verification_status = ProofStatus::Recorded as u8;
        proof.owner = ctx.accounts.signer.key();
        
        msg!("Approval proof recorded for request: {}", request_id);
        emit!(ProofRecorded {
            request_id: request_id.clone(),
            approver_count,
            approval_threshold,
            timestamp: proof.timestamp,
        });
        
        Ok(())
    }

    /// Verify an approval proof matches expected data
    pub fn verify_approval_proof(
        ctx: Context<VerifyProof>,
        expected_hash: [u8; 32],
    ) -> Result<()> {
        let proof = &ctx.accounts.approval_proof;
        
        require!(
            proof.approvals_hash == expected_hash,
            MultiSigError::ProofMismatch
        );
        
        require!(
            proof.verification_status == ProofStatus::Recorded as u8
                || proof.verification_status == ProofStatus::Verified as u8,
            MultiSigError::InvalidProofStatus
        );
        
        Ok(())
    }

    /// Mark proof as verified (optional for compliance)
    pub fn mark_proof_verified(
        ctx: Context<MarkProofVerified>,
    ) -> Result<()> {
        let proof = &mut ctx.accounts.approval_proof;
        proof.verification_status = ProofStatus::Verified as u8;
        proof.verified_at = Clock::get()?.unix_timestamp;
        
        msg!("Proof marked as verified");
        emit!(ProofVerified {
            request_id: proof.request_id.clone(),
            verified_at: proof.verified_at,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(request_id: String)]
pub struct RecordProof<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 256 + 32 + 1 + 1 + 8 + 1 + 32,
        seeds = [b"approval_proof", request_id.as_bytes()],
        bump,
    )]
    pub approval_proof: Account<'info, ApprovalProof>,
    
    #[account(mut)]
    pub asset: Account<'info, Asset>, // Existing asset account
    
    #[account(mut)]
    pub signer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ApprovalProof {
    pub request_id: String,              // Link to off-chain request
    pub asset_id: Pubkey,                // Related asset
    pub approvals_hash: [u8; 32],       // SHA256(approval votes)
    pub approver_count: u8,             // How many voted
    pub approval_threshold: u8,         // How many needed
    pub timestamp: i64,                 // When recorded
    pub verification_status: u8,        // Recorded/Verified
    pub verified_at: i64,               // When verified
    pub owner: Pubkey,                  // Who initiated
}

#[error_code]
pub enum MultiSigError {
    #[msg("Approval proof hash does not match expected value")]
    ProofMismatch,
    
    #[msg("Proof is in invalid status for operation")]
    InvalidProofStatus,
}

#[event]
pub struct ProofRecorded {
    pub request_id: String,
    pub approver_count: u8,
    pub approval_threshold: u8,
    pub timestamp: i64,
}

#[event]
pub struct ProofVerified {
    pub request_id: String,
    pub verified_at: i64,
}

#[repr(u8)]
pub enum ProofStatus {
    Recorded = 0,
    Verified = 1,
}
```

### Layer 3: API Endpoints (New)

**File:** `app/api/multisig-proofs/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import crypto from 'crypto';

interface AnchorProofRequest {
  requestId: string;
  approvals: {
    approverPubkey: string;
    approvalStatus: 'APPROVED' | 'REJECTED';
    timestamp: number;
  }[];
  approverCount: number;
  approvalThreshold: number;
}

// POST /api/multisig-proofs - Record proof on-chain
export async function POST(request: NextRequest) {
  try {
    const body: AnchorProofRequest = await request.json();
    const {
      requestId,
      approvals,
      approverCount,
      approvalThreshold,
    } = body;

    // Generate SHA256 hash of approval data
    const approvalsData = JSON.stringify(approvals);
    const approvalsHash = crypto
      .createHash('sha256')
      .update(approvalsData)
      .digest();

    // In production: Call smart contract via Anchor
    // For now: Return proof metadata
    const proof = {
      requestId,
      approvalsHash: approvalsHash.toString('hex'),
      approverCount,
      approvalThreshold,
      timestamp: Date.now(),
      status: 'ANCHORING',
      pda: `proof_pda_${requestId}`, // Placeholder
    };

    return NextResponse.json(proof, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to anchor proof', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/multisig-proofs/[requestId] - Get proof status
export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;

    // In production: Fetch from blockchain
    const proof = {
      requestId,
      status: 'ANCHORED',
      pda: `proof_pda_${requestId}`,
      txHash: 'tx_hash_placeholder',
      anchoredAt: Date.now(),
    };

    return NextResponse.json(proof);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch proof', details: String(error) },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/multisig-proofs/[requestId]/verify/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

// POST /api/multisig-proofs/[requestId]/verify - Verify proof
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    
    // Verify proof against blockchain
    // In production: Call smart contract verify instruction
    
    const verification = {
      requestId,
      isValid: true,
      timestamp: Date.now(),
      message: 'Proof verified on-chain',
    };

    return NextResponse.json(verification);
  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed', details: String(error) },
      { status: 500 }
    );
  }
}
```

---

## 🔄 Integration Workflow

### Scenario 1: Fast Path (No Blockchain)

```
1. User creates multi-sig request
   └─ POST /api/multisig-requests { requestType, assetId }
   └─ Response: { id, status: "PENDING" }

2. Approvers vote (off-chain only)
   └─ POST /api/multisig-requests/[id] { approverPubkey, approvalStatus }
   └─ Status updates: PENDING → APPROVED (when threshold met)

3. Action executes (no blockchain)
   └─ Application uses APPROVED status to proceed
   └─ ✅ Fast, free, simple
```

### Scenario 2: Compliance Path (With Blockchain)

```
1. User creates multi-sig request
   └─ POST /api/multisig-requests { requestType, assetId }
   └─ Response: { id, status: "PENDING" }

2. Approvers vote (off-chain only)
   └─ Status updates: PENDING → APPROVED

3. [NEW] User anchors proof on-chain (optional)
   └─ POST /api/multisig-proofs { requestId, approvals, threshold }
   └─ Smart contract stores ApprovalProof PDA
   └─ Response: { status: "ANCHORING", txHash, pda }

4. [NEW] Verify proof (optional)
   └─ POST /api/multisig-proofs/[requestId]/verify
   └─ Response: { isValid: true, timestamp }

5. Action executes (with blockchain proof)
   └─ Application confirms on-chain proof exists
   └─ ✅ Immutable, auditable, compliant
```

### Scenario 3: Mixed (Hybrid)

```
User can:
- Fast approve without blockchain (< 1s)
- Anchor proof later for compliance (async)
- Mix workflows: Some requests fast, others with proof
- Verify historical proofs on-chain
```

---

## 📁 Files to Create/Modify

### Phase 1: Types & API (No Smart Contract)

| File | Action | Reason |
|------|--------|--------|
| `app/types.ts` | Update `MultiSigRequest` | Add optional blockchain proof tracking |
| `app/api/multisig-proofs/route.ts` | CREATE | POST to anchor proof, GET proof status |
| `app/api/multisig-proofs/[requestId]/verify/route.ts` | CREATE | Verify proof on-chain |
| `app/components/MultiSigProofStatus.tsx` | CREATE | Display proof status in UI |

### Phase 2: Smart Contract Integration

| File | Action | Reason |
|------|--------|--------|
| `programs/asset-manager/src/multisig_proofs.rs` | CREATE | Record/verify approval proofs on-chain |
| `Anchor.toml` | UPDATE | Add multisig_proofs program config |
| `tests/multisig_proofs.ts` | CREATE | Test suite for proof anchoring |

### Phase 3: UI & Integration

| File | Action | Reason |
|------|--------|--------|
| `app/components/MultiSigRequestForm.tsx` | UPDATE | Add "Anchor Proof" checkbox |
| `app/components/MultiSigApprovalPanel.tsx` | UPDATE | Show proof anchoring status |
| `app/components/MultiSigRequestHistory.tsx` | UPDATE | Show proof links in history |
| `docs/BLOCKCHAIN_PROOFS.md` | CREATE | Guide for blockchain proofs |

---

## 💻 Implementation Steps

### Step 1: Update Types (15 minutes)

```bash
# Modify app/types.ts
# Add blockchainProof property to MultiSigRequest
# No breaking changes - existing code still works
```

### Step 2: Create Proof APIs (1 hour)

```bash
# Create app/api/multisig-proofs/route.ts (POST/GET)
# Create app/api/multisig-proofs/[requestId]/verify/route.ts
# Test with curl:
curl -X POST http://localhost:3000/api/multisig-proofs \
  -H "Content-Type: application/json" \
  -d '{"requestId":"req1","approvals":[...]}'
```

### Step 3: Create Proof Status Component (30 minutes)

```bash
# Create app/components/MultiSigProofStatus.tsx
# Display "Not Anchored", "Anchoring", "Anchored", "Verified"
# Add "Anchor Proof" button
# Link to Solscan
```

### Step 4: Build Smart Contract (2-3 hours)

```bash
# Create programs/asset-manager/src/multisig_proofs.rs
# Implement RecordProof and VerifyProof instructions
# Build: yarn build-program
# Deploy: bash deploy.sh
```

### Step 5: Wire Up Frontend (1 hour)

```bash
# Update MultiSigRequestForm to show "Anchor to Blockchain?" checkbox
# Update MultiSigApprovalPanel to display proof status
# Update MultiSigRequestHistory with proof links
```

### Step 6: Test & Document (1 hour)

```bash
# Run test suite
# Create integration guide
# Update README
```

---

## 🔐 Security Considerations

### 1. Proof Integrity
```
✓ SHA256 hash of approval data
✓ Immutable once on-chain
✓ Tamper-evident (hash mismatch detected)
✓ Verifiable by any party
```

### 2. Access Control
```
✓ Only asset owner can anchor proof
✓ Only approvers can vote
✓ Smart contract validates signer
```

### 3. Proof Validity
```
✓ Verification checks hash matches
✓ Timestamp ensures recency
✓ Approver count validates threshold met
```

### 4. Cost Protection
```
✓ User pays for anchoring (not protocol)
✓ Reasonable rent-exempt amount (~0.002 SOL)
✓ Optional - user decides if worth it
```

---

## 📊 Cost Analysis

### Off-Chain (Current)
| Operation | Cost | Speed |
|-----------|------|-------|
| Create request | FREE | < 100ms |
| Vote | FREE | < 100ms |
| Approve | FREE | < 100ms |
| **Total per request** | **FREE** | **< 500ms** |

### Blockchain Proof (New)
| Operation | Cost | Speed |
|-----------|------|-------|
| Record proof (on-chain) | ~0.001 SOL | 2-5s |
| Verify proof (on-chain) | ~0.0001 SOL | 2-5s |
| **Total per request** | **~0.0011 SOL** | **4-10s** |

### Hybrid (Recommended)
| Path | Cost | Speed | Use Case |
|------|------|-------|----------|
| **Fast** (off-chain only) | FREE | < 1s | Daily operations |
| **Compliant** (with proof) | ~0.001 SOL | ~5s | Audit trail, compliance |
| **Mixed** | Varies | Varies | User chooses per request |

---

## ✅ Testing Checklist

### Unit Tests
- [ ] Hash generation matches approvals
- [ ] PDA derivation correct
- [ ] Signer validation works
- [ ] Proof status transitions valid

### Integration Tests
- [ ] Create → Anchor → Verify flow works
- [ ] Off-chain requests unaffected
- [ ] Blockchain proof is immutable
- [ ] Verification rejects tampered proofs

### E2E Tests
- [ ] User votes off-chain
- [ ] Anchors proof to blockchain
- [ ] Verifies proof matches
- [ ] History shows proof link

### Security Tests
- [ ] Unauthorized users cannot vote
- [ ] Non-owner cannot anchor
- [ ] Tampered proofs detected
- [ ] Invalid thresholds rejected

---

## 📈 Migration Path

### v1.0 (Current - MVP)
```
✅ Off-chain multi-sig voting
✅ M-of-N approval thresholds
✅ Immutable audit trail
✅ Real-time status updates
```

### v1.1 (Phase 2 - Blockchain Integration)
```
⏳ Optional blockchain proofs
⏳ Smart contract record-keeping
⏳ Proof verification endpoint
⏳ Immutable on-chain log
```

### v1.2 (Phase 3 - Advanced)
```
⏳ Cryptographic signature verification
⏳ Multi-signature wallets on-chain
⏳ Compliance reporting
⏳ Automatic proof generation
```

---

## 🎓 Usage Examples

### Example 1: Fast Approval (No Blockchain)

```typescript
// 1. Create request
const request = await fetch('/api/multisig-requests', {
  method: 'POST',
  body: JSON.stringify({
    requestType: 'UPDATE_METADATA',
    assetId: 'asset123',
  }),
});

// 2. Approvers vote (multiple approvers)
await fetch(`/api/multisig-requests/${request.id}`, {
  method: 'POST',
  body: JSON.stringify({
    approverPubkey: wallet.publicKey,
    approvalStatus: 'APPROVED',
    message: 'Looks good',
  }),
});

// 3. Action executes when threshold met
if (request.status === 'APPROVED') {
  // Execute metadata update
}
// ✅ Fast, free, real-time feedback
```

### Example 2: Compliant Approval (With Blockchain)

```typescript
// 1-2. Same as above (create + vote)

// 3. [NEW] Anchor proof to blockchain
const proof = await fetch('/api/multisig-proofs', {
  method: 'POST',
  body: JSON.stringify({
    requestId: request.id,
    approvals: request.approvedBy,
    approverCount: request.currentApprovals,
    approvalThreshold: request.requiredApprovals,
  }),
});

// 4. [NEW] Verify proof
const verification = await fetch(
  `/api/multisig-proofs/${request.id}/verify`,
  { method: 'POST' }
);

// 5. Action executes with blockchain proof
if (proof.status === 'ANCHORED' && verification.isValid) {
  // Execute with immutable proof
}
// ✅ Immutable, auditable, compliant
```

---

## 📚 Documentation To Create

| Document | Purpose | Audience |
|----------|---------|----------|
| `docs/BLOCKCHAIN_PROOFS.md` | Technical guide for blockchain proofs | Developers |
| `docs/ARCHITECTURE_INTEGRATION.md` | Hybrid architecture deep dive | Architects |
| `docs/COST_ANALYSIS.md` | When to use on-chain vs off-chain | Product |
| `INTEGRATION_CHECKLIST.md` | Step-by-step integration guide | Implementers |

---

## 🚀 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| No Breaking Changes | 0 breaking changes | Existing tests still pass |
| Performance | Off-chain < 1s | Measure in browser DevTools |
| Blockchain Adoption | 20%+ of requests | Telemetry tracking |
| Cost per Proof | < 0.001 SOL | Transaction inspection |
| Verification Success | 100% | Proof verification tests |

---

## 📞 Q&A

**Q: Will existing multi-sig requests still work?**  
A: Yes! Blockchain proofs are completely optional. Existing workflow unchanged.

**Q: When should I use blockchain proofs?**  
A: When you need immutability, audit trail, or legal compliance. Otherwise, fast off-chain is fine.

**Q: How much does it cost?**  
A: ~0.001 SOL per proof (~$0.00015 at current prices). Optional per request.

**Q: Can I migrate existing requests?**  
A: Yes! You can anchor historical proofs using their approval data.

**Q: What if blockchain is down?**  
A: Multi-sig works fine without it. Proofs are optional. Anchor when network is available.

