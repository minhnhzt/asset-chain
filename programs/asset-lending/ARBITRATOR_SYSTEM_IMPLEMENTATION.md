# 🏛️ Asset Lending với Arbitrator System - Implementation Summary

## 📊 Tổng quan Kiến trúc

Hệ thống NFT Lending được nâng cấp với 3 lớp bảo mật:

1. **Stake & Slash** - Giám định viên phải cược tiền đảm bảo
2. **M-of-N Oracle** - Đồng thuận từ nhiều giám định viên
3. **Dispute Resolution** - Khiếu nại và vote từ Hội đồng DAO

---

## 🗂️ Cấu trúc File

```
programs/asset-lending/src/
├── lib.rs              # Main program + legacy instructions
├── state.rs            # All account structures
├── errors.rs           # Error codes
├── arbitrator.rs       # Stake/Slash management
├── verification.rs     # M-of-N verification logic
└── dispute.rs          # Dispute resolution system
```

---

## 📦 Account Structures

### 1. GlobalConfig (PDA: `["global_config"]`)
```rust
pub struct GlobalConfig {
    pub admin: Pubkey,                    // Admin toàn quyền
    pub min_stake_amount: u64,            // Stake tối thiểu (USDC)
    pub treasury: Pubkey,                 // Kho bạc DAO
    pub dispute_fee: u64,                 // Phí khiếu nại
    pub dispute_window_duration: i64,     // 24h window
    pub voting_duration: i64,             // 48h voting
    pub council_members: Vec<Pubkey>,     // Max 50 members
}
```

### 2. ArbitratorProfile (PDA: `["arbitrator", authority]`)
```rust
pub struct ArbitratorProfile {
    pub authority: Pubkey,
    pub stake_vault: Pubkey,              // PDA vault chứa USDC
    pub stake_amount: u64,
    pub is_active: bool,
    pub reputation_score: u64,            // Điểm uy tín (± 5/50)
    pub verified_count: u64,
    pub slashed_count: u64,
}
```

### 3. LoanEscrowAccount (Enhanced - PDA: `["loan_escrow", owner, asset_mint]`)
```rust
pub struct LoanEscrowAccount {
    // Original fields
    pub owner: Pubkey,
    pub borrower: Pubkey,
    pub asset_mint: Pubkey,
    pub loan_start_time: i64,
    pub loan_end_time: i64,
    
    // NEW: M-of-N fields
    pub status: LoanStatus,               // Active | ReturnPending | Completed | InDispute
    pub arbitrator_set: Vec<Pubkey>,      // N arbitrators (max 10)
    pub required_approvals: u8,           // M required
    pub approvals: Vec<Pubkey>,           // Current approvals
    pub dispute_window_start: i64,        // Timestamp when 1st verify
}
```

### 4. DisputeCase (PDA: `["dispute", loan_account]`)
```rust
pub struct DisputeCase {
    pub loan_account: Pubkey,
    pub complainant: Pubkey,              // Owner | Borrower
    pub evidence_link: String,            // IPFS/Arweave (max 200 chars)
    pub status: DisputeStatus,            // Open | Voting | Resolved
    pub opened_at: i64,
    pub voting_ends_at: i64,
    
    // Council voting
    pub appeal_votes_for: u16,
    pub appeal_votes_against: u16,
    pub voted_members: Vec<Pubkey>,       // Max 50
}
```

---

## 🔧 Instructions Overview

### Configuration (1 instruction)
- `initialize_config()` - Setup global parameters

### Arbitrator Management (3 instructions)
- `register_arbitrator(stake_amount)` - Stake USDC để trở thành GĐV
- `withdraw_stake(amount)` - Rút tiền stake
- `slash_arbitrator(authority, amount)` - Phạt GĐV gian lận (admin only)

### Loan Management (9 instructions)
- **Core Flow:**
  - `lend_asset()` - Owner cho mượn NFT (giữ nguyên)
  - `assign_arbitrators(set, M)` - Owner chỉ định N GĐV và ngưỡng M
  - `initiate_return()` - Borrower đánh dấu đã trả
  - `arbitrator_verify_return()` - GĐV xác nhận (cần M/N)
  - `complete_loan()` - Hoàn tất sau khi đủ M approvals

- **Legacy Flow (backward compatible):**
  - `return_asset()` - Simple return không cần GĐV
  - `reclaim_asset()` - Owner thu hồi sau expiry
  - `revoke_loan()` - Owner hủy khẩn cấp

### Dispute Resolution (5 instructions)
- `raise_dispute(evidence)` - Owner/Borrower khiếu nại (nộp phí)
- `cast_appeal_vote(vote_for)` - Council member vote
- `resolve_dispute()` - Thi hành phán quyết (sau voting ends)
- `add_council_member(pubkey)` - Admin thêm thành viên
- `remove_council_member(pubkey)` - Admin xóa thành viên

---

## 🔄 Workflow Diagrams

### Standard M-of-N Flow
```
Owner                    Borrower                Arbitrators (3/5)              System
  |                         |                           |                          |
  |--lend_asset()---------->|                           |                          |
  |<---NFT to Escrow--------|                           |                          |
  |                         |                           |                          |
  |--assign_arbitrators()-->|                           |                          |
  |   (Set: [A,B,C,D,E])    |                           |                          |
  |   (Required: 3)         |                           |                          |
  |                         |                           |                          |
  |                         |--initiate_return()------->|                          |
  |                         |   (Status: ReturnPending) |                          |
  |                         |                           |                          |
  |                         |                           |--verify_return() (A)---->| +1 approval
  |                         |                           |--verify_return() (B)---->| +1 approval  
  |                         |                           |--verify_return() (C)---->| +1 approval (M reached!)
  |                         |                           |                          |
  |                         |                           |                          |--Status: Completed
  |                         |                           |                          |
  |--complete_loan()------->|                           |                          |
  |<---NFT returned---------|                           |                          |
```

### Dispute Flow
```
Owner/Borrower           Council (DAO)              Arbitrators              System
      |                       |                          |                      |
      |--raise_dispute()----->|                          |                      |
      |   (Pay fee)           |                          |                      |--Status: InDispute
      |                       |                          |                      |--Lock loan
      |                       |                          |                      |
      |                       |--cast_vote() (Member 1)->|                      | FOR: +1
      |                       |--cast_vote() (Member 2)->|                      | FOR: +1
      |                       |--cast_vote() (Member 3)->|                      | AGAINST: +1
      |                       |                          |                      |
      |                       |     (48h voting period)  |                      |
      |                       |                          |                      |
      |--resolve_dispute()--->|                          |                      |
      |                       |   (FOR wins: 2 > 1)      |                      |
      |                       |                          |                      |--Reverse decision
      |                       |                          |<--slash_arbitrator()--| Penalize A,B,C
      |<--Refund + Asset------|                          |                      |
```

---

## 🛡️ Security Features

### Stake & Slash
- **Min stake**: Configurable (e.g. 10,000 USDC)
- **Slash amount**: Transferred to DAO treasury
- **Reputation system**: ±5 per verify, -50 per slash
- **Auto-deactivate**: If stake < minimum

### M-of-N Threshold
- **Prevents single-point failure**: Need M out of N arbitrators
- **Example**: 3/5 means 3 signatures required from 5 total
- **Max arbitrators per loan**: 10
- **Approval tracking**: Vec<Pubkey> prevents double-approval

### Dispute Window
- **Duration**: 24h (configurable) after first verify
- **Complainant**: Only owner/borrower
- **Fee required**: Prevents spam
- **Lock mechanism**: Status → InDispute blocks completion

### Council Voting
- **Whitelist**: Max 50 members (admin-managed)
- **Simple majority**: votes_for > votes_against
- **One vote per member**: Vec tracking prevents double-vote
- **Time-bound**: 48h voting window

---

## 💰 Fee & Incentive Structure

| Action | Fee/Reward | Recipient |
|--------|-----------|-----------|
| Register Arbitrator | Stake (10,000 USDC) | Stake Vault (locked) |
| Verify Return | +5 reputation | Arbitrator Profile |
| Successful Verification | (Optional) Service fee | Arbitrator |
| Raise Dispute | Dispute fee (e.g. 100 USDC) | DAO Treasury |
| Slash Arbitrator | Stake amount | DAO Treasury |
| Win Dispute | Refund fee | Complainant |

---

## 🧪 Testing Strategy

### Unit Tests (Per Module)
1. **Arbitrator Module**:
   - ✅ Register with min/max stake
   - ✅ Withdraw partial/full stake
   - ✅ Slash reduces reputation
   - ❌ Non-admin cannot slash

2. **Verification Module**:
   - ✅ Assign valid M-of-N set
   - ❌ M > N fails
   - ✅ Borrower initiates return
   - ✅ Arbitrator approves (repeat M times)
   - ❌ Non-arbitrator cannot approve
   - ❌ Double approval fails
   - ✅ Complete loan after M approvals

3. **Dispute Module**:
   - ✅ Owner/Borrower raises dispute
   - ❌ Random user cannot raise
   - ✅ Council member votes
   - ❌ Non-council cannot vote
   - ❌ Double vote fails
   - ✅ Resolve after voting ends
   - ❌ Resolve before voting ends fails

### Integration Tests
- **E2E Happy Path**: Lend → Assign → Return → Verify (M times) → Complete
- **E2E Dispute Path**: Lend → Verify → Dispute → Vote → Resolve → Slash
- **Edge Cases**: Expired loan, insufficient stake, vote tie

---

## 📊 Gas/Storage Costs (Estimates)

| Account | Size | Rent (SOL) |
|---------|------|------------|
| GlobalConfig | ~1,700 bytes | ~0.012 SOL |
| ArbitratorProfile | ~106 bytes | ~0.001 SOL |
| LoanEscrowAccount | ~850 bytes | ~0.006 SOL |
| DisputeCase | ~1,850 bytes | ~0.013 SOL |

**Total per loan with dispute**: ~0.032 SOL (~$5 at $150/SOL)

---

## 🚀 Deployment Checklist

- [ ] Deploy program to devnet
- [ ] Initialize GlobalConfig
  - Set min_stake_amount: 10,000 USDC
  - Set dispute_fee: 100 USDC
  - Set dispute_window: 86400 (24h)
  - Set voting_duration: 172800 (48h)
- [ ] Add initial council members (5-10)
- [ ] Register test arbitrators (3-5)
- [ ] Run E2E test on devnet
- [ ] Audit smart contract
- [ ] Deploy to mainnet

---

## 🔮 Future Enhancements

1. **Dynamic Arbitrator Selection**: Auto-assign based on reputation
2. **Automated Fee Distribution**: Pay arbitrators from loan fees
3. **Tiered Staking**: Higher stake = higher reputation weight
4. **Slashing Appeals**: Multi-tier dispute for slashed arbitrators
5. **DAO Governance**: Token-based voting for config changes
6. **Oracle Integration**: Chainlink/Pyth for asset valuation
7. **Insurance Pool**: Cover losses from arbitrator failures

---

## 📚 References

- [Anchor Framework Docs](https://www.anchor-lang.com/)
- [Solana Cookbook - PDAs](https://solanacookbook.com/core-concepts/pdas.html)
- [UMA Protocol - Optimistic Oracle](https://docs.umaproject.org/)
- [Kleros - Dispute Resolution](https://kleros.io/whitepaper.pdf)

---

## 🏁 Current Implementation Status

✅ **Completed**:
- State structures (4 accounts)
- Error codes (24 errors)
- Arbitrator module (4 instructions)
- Verification module (5 instructions)
- Dispute module (5 instructions)
- Main lib.rs integration

⏳ **In Progress**:
- Build fixes (file corruption issue)
- Test suite creation

🔜 **Next Steps**:
1. Fix lib.rs build error
2. Write comprehensive test suite
3. Deploy to devnet
4. Create frontend integration guide
5. Security audit

---

*Generated: 2025-10-27*
*Version: 1.0.0*
*License: MIT*
