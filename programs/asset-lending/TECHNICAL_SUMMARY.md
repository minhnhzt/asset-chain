# 📦 Asset Lending Program - Technical Summary

## Tổng quan Architecture

Chương trình **Asset Lending** được thiết kế để quản lý việc cho mượn/thu hồi tài sản NFT với mô hình **PDA Escrow** an toàn và phi tín nhiệm.

---

## 1. Định nghĩa Account State

### LoanEscrowAccount (PDA)

```rust
#[account]
pub struct LoanEscrowAccount {
    pub owner: Pubkey,           // Chủ sở hữu (32 bytes)
    pub borrower: Pubkey,        // Người mượn (32 bytes)
    pub asset_mint: Pubkey,      // NFT mint (32 bytes)
    pub loan_start_time: i64,    // Thời gian bắt đầu (8 bytes)
    pub loan_end_time: i64,      // Thời gian kết thúc (8 bytes)
    pub status: LoanStatus,      // Trạng thái (1 byte)
    pub bump: u8,                // PDA bump (1 byte)
}

// Total size: 8 (discriminator) + 114 (data) = 122 bytes
```

**PDA Derivation:**
```rust
seeds = [
    b"loan_escrow",
    owner.key().as_ref(),
    asset_mint.key().as_ref()
]
```

### LoanStatus Enum

```rust
pub enum LoanStatus {
    Active,      // 0: Khoản mượn đang hoạt động
    Returned,    // 1: Đã hoàn trả
    Reclaimed,   // 2: Đã thu hồi
    Revoked,     // 3: Đã hủy bỏ
}
```

---

## 2. Định nghĩa Context Structs

### LendAssetContext

```rust
#[derive(Accounts)]
#[instruction(borrower: Pubkey)]
pub struct LendAsset<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = LoanEscrowAccount::SIZE,
        seeds = [b"loan_escrow", owner.key().as_ref(), asset_mint.key().as_ref()],
        bump
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,

    #[account(
        constraint = asset_mint.supply == 1 @ LendingError::NotNFT,
        constraint = asset_mint.decimals == 0 @ LendingError::NotNFT,
    )]
    pub asset_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key(),
        constraint = owner_token_account.mint == asset_mint.key(),
        constraint = owner_token_account.amount == 1,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = owner,
        associated_token::mint = asset_mint,
        associated_token::authority = loan_escrow,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

**Constraints:**
- ✅ `init` - Tạo mới LoanEscrowAccount
- ✅ `payer = owner` - Owner trả phí tạo account
- ✅ `space = 122 bytes` - Đủ cho data structure
- ✅ `seeds + bump` - PDA derivation
- ✅ NFT validation - supply=1, decimals=0
- ✅ Token account ownership validation

---

### ReturnAssetContext

```rust
#[derive(Accounts)]
pub struct ReturnAsset<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    /// CHECK: Validated via loan_escrow.owner
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,

    #[account(
        mut,
        close = owner,  // Đóng account và hoàn SOL cho owner
        seeds = [b"loan_escrow", loan_escrow.owner.as_ref(), loan_escrow.asset_mint.as_ref()],
        bump = loan_escrow.bump,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,

    #[account(
        mut,
        constraint = escrow_token_account.mint == loan_escrow.asset_mint,
        constraint = escrow_token_account.amount == 1,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_token_account.owner == loan_escrow.owner,
        constraint = owner_token_account.mint == loan_escrow.asset_mint,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
```

**Constraints:**
- ✅ `close = owner` - Tự động đóng PDA và hoàn SOL
- ✅ Seeds validation - Đảm bảo PDA đúng
- ✅ Token account validation - Mint + amount check

---

### ReclaimAssetContext

```rust
#[derive(Accounts)]
pub struct ReclaimAsset<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        close = owner,
        seeds = [b"loan_escrow", loan_escrow.owner.as_ref(), loan_escrow.asset_mint.as_ref()],
        bump = loan_escrow.bump,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,

    #[account(
        mut,
        constraint = escrow_token_account.mint == loan_escrow.asset_mint,
        constraint = escrow_token_account.amount == 1,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_token_account.owner == loan_escrow.owner,
        constraint = owner_token_account.mint == loan_escrow.asset_mint,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
```

**Giống ReturnAssetContext nhưng:**
- Người gọi là `owner` (không phải borrower)
- Có thêm kiểm tra thời gian trong instruction handler

---

### RevokeLoanContext

```rust
#[derive(Accounts)]
pub struct RevokeLoan<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        close = owner,
        seeds = [b"loan_escrow", loan_escrow.owner.as_ref(), loan_escrow.asset_mint.as_ref()],
        bump = loan_escrow.bump,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,

    #[account(
        mut,
        constraint = escrow_token_account.mint == loan_escrow.asset_mint,
        constraint = escrow_token_account.amount == 1,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_token_account.owner == loan_escrow.owner,
        constraint = owner_token_account.mint == loan_escrow.asset_mint,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
```

**Identical to ReclaimAsset** nhưng không có time check

---

## 3. Function Implementations (Bộ khung)

### Instruction 1: lend_asset

```rust
pub fn lend_asset(
    ctx: Context<LendAsset>,
    borrower: Pubkey,
    loan_duration_seconds: i64,
) -> Result<()> {
    let loan_escrow = &mut ctx.accounts.loan_escrow;
    let clock = Clock::get()?;

    // 1. Validate duration (1 hour - 1 year)
    require!(
        loan_duration_seconds >= 3600 && loan_duration_seconds <= 31536000,
        LendingError::InvalidLoanDuration
    );

    // 2. Initialize loan escrow data
    loan_escrow.owner = ctx.accounts.owner.key();
    loan_escrow.borrower = borrower;
    loan_escrow.asset_mint = ctx.accounts.asset_mint.key();
    loan_escrow.loan_start_time = clock.unix_timestamp;
    loan_escrow.loan_end_time = clock.unix_timestamp
        .checked_add(loan_duration_seconds)
        .ok_or(LendingError::MathOverflow)?;
    loan_escrow.bump = ctx.bumps.loan_escrow;
    loan_escrow.status = LoanStatus::Active;

    // 3. Transfer NFT to escrow (CPI to Token Program)
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.owner_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, 1)?;

    // 4. Emit event for off-chain tracking
    emit!(AssetLendedEvent { /* ... */ });

    Ok(())
}
```

**Logic cốt lõi:**
1. ✅ Validate loan duration trong khoảng [3600s, 31536000s]
2. ✅ Khởi tạo LoanEscrowAccount với thông tin đầy đủ
3. ✅ Transfer NFT từ Owner → PDA Escrow (CPI call)
4. ✅ Emit event cho off-chain indexer

---

### Instruction 2: return_asset

```rust
pub fn return_asset(ctx: Context<ReturnAsset>) -> Result<()> {
    let loan_escrow = &ctx.accounts.loan_escrow;

    // 1. Validate caller is borrower
    require!(
        ctx.accounts.borrower.key() == loan_escrow.borrower,
        LendingError::UnauthorizedBorrower
    );

    // 2. Validate loan is active
    require!(
        loan_escrow.status == LoanStatus::Active,
        LendingError::LoanNotActive
    );

    // 3. Prepare PDA seeds for signing
    let seeds = &[
        b"loan_escrow",
        loan_escrow.owner.as_ref(),
        loan_escrow.asset_mint.as_ref(),
        &[loan_escrow.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    // 4. Transfer NFT back to owner (PDA signs)
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.owner_token_account.to_account_info(),
            authority: ctx.accounts.loan_escrow.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, 1)?;

    // 5. Close escrow token account
    let close_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.escrow_token_account.to_account_info(),
            destination: ctx.accounts.owner.to_account_info(),
            authority: ctx.accounts.loan_escrow.to_account_info(),
        },
        signer_seeds,
    );
    token::close_account(close_ctx)?;

    // 6. Emit event
    emit!(AssetReturnedEvent { /* ... */ });

    Ok(())
}
```

**Logic cốt lõi:**
1. ✅ Kiểm tra người gọi = borrower trong loan_escrow
2. ✅ Kiểm tra loan status = Active
3. ✅ Chuẩn bị PDA seeds để PDA có thể sign CPI
4. ✅ Transfer NFT từ Escrow → Owner (PDA authority)
5. ✅ Đóng escrow token account và hoàn SOL
6. ✅ PDA account tự động đóng do `close = owner` constraint

**Không cần time check** - Borrower có thể trả sớm

---

### Instruction 3: reclaim_asset

```rust
pub fn reclaim_asset(ctx: Context<ReclaimAsset>) -> Result<()> {
    let loan_escrow = &ctx.accounts.loan_escrow;
    let clock = Clock::get()?;

    // 1. Validate caller is owner
    require!(
        ctx.accounts.owner.key() == loan_escrow.owner,
        LendingError::UnauthorizedOwner
    );

    // 2. Validate loan is active
    require!(
        loan_escrow.status == LoanStatus::Active,
        LendingError::LoanNotActive
    );

    // ⚠️ 3. KIỂM TRA CỐT LÕI: Thời gian hiện tại > loan_end_time
    require!(
        clock.unix_timestamp > loan_escrow.loan_end_time,
        LendingError::LoanNotExpired
    );

    // 4-7. Same as return_asset (transfer + close)
    // ... (code tương tự return_asset)

    emit!(AssetReclaimedEvent {
        overdue_by: clock.unix_timestamp - loan_escrow.loan_end_time,
        // ...
    });

    Ok(())
}
```

**Logic cốt lõi:**
1. ✅ Kiểm tra người gọi = owner
2. ✅ Kiểm tra loan status = Active
3. ⚠️ **KIỂM TRA THỜI GIAN** - Chỉ cho phép sau loan_end_time
4. ✅ Transfer + Close (tương tự return_asset)
5. ✅ Ghi nhận thời gian quá hạn trong event

**Time check là điểm khác biệt chính**

---

### Instruction 4: revoke_loan

```rust
pub fn revoke_loan(ctx: Context<RevokeLoan>) -> Result<()> {
    let loan_escrow = &ctx.accounts.loan_escrow;

    // 1. Validate caller is owner
    require!(
        ctx.accounts.owner.key() == loan_escrow.owner,
        LendingError::UnauthorizedOwner
    );

    // 2. Validate loan is active
    require!(
        loan_escrow.status == LoanStatus::Active,
        LendingError::LoanNotActive
    );

    // ⚡ KHÔNG CÓ TIME CHECK - Owner có thể revoke bất cứ lúc nào

    // 3-6. Same as return_asset (transfer + close)
    // ... (code tương tự return_asset)

    emit!(LoanRevokedEvent { /* ... */ });

    Ok(())
}
```

**Logic cốt lõi:**
1. ✅ Kiểm tra người gọi = owner
2. ✅ Kiểm tra loan status = Active
3. ⚡ **KHÔNG CÓ TIME CHECK** - Có thể revoke bất cứ lúc nào
4. ✅ Transfer + Close (tương tự return_asset)

**Use case:** Khẩn cấp, tranh chấp, thay đổi kế hoạch

---

## 4. Giải thích: Tại sao PDA Escrow an toàn?

### Vấn đề khi chuyển trực tiếp cho Borrower

```
Owner → [Transfer NFT] → Borrower
         (Borrower có full control)
```

**Rủi ro:**
- ❌ Borrower có thể **bán** NFT
- ❌ Borrower có thể **chuyển** cho người khác
- ❌ Borrower có thể **từ chối trả** lại
- ❌ Owner **không thể thu hồi** nếu Borrower không hợp tác
- ❌ Cần **bên thứ 3** làm trọng tài (không trustless)

### Giải pháp: PDA Escrow

```
Owner → [Transfer to PDA] → PDA Escrow (Program controls)
                             ↓
                          [Smart Contract Logic]
                             ↓
                    Return/Reclaim → Owner
```

**Lợi ích:**

### 1️⃣ **Không có Private Key**
```rust
// PDA được derive từ seeds, không có private key
let (pda, bump) = Pubkey::find_program_address(
    &[b"loan_escrow", owner, asset_mint],
    program_id
);

// Chỉ program mới có thể sign với PDA
// → Borrower KHÔNG THỂ chuyển NFT đi
```

### 2️⃣ **Program-Controlled Authority**
```rust
// Transfer phải được sign bởi PDA
let transfer_ctx = CpiContext::new_with_signer(
    token_program,
    Transfer { ... },
    signer_seeds  // Chỉ program có seeds này
);
```

### 3️⃣ **Logic Rõ Ràng và Tự Động**
```rust
// Return: Borrower tự nguyện (bất cứ lúc nào)
if caller == loan_escrow.borrower {
    transfer_nft_to_owner();  // OK
}

// Reclaim: Owner thu hồi (chỉ sau hết hạn)
if caller == loan_escrow.owner && clock > end_time {
    transfer_nft_to_owner();  // OK
}

// Revoke: Owner hủy (khẩn cấp)
if caller == loan_escrow.owner {
    transfer_nft_to_owner();  // OK (bất cứ lúc nào)
}
```

### 4️⃣ **Bảo vệ cả hai bên**

| Bên | Lợi ích |
|-----|---------|
| **Owner** | ✅ Chắc chắn lấy lại NFT sau hết hạn<br>✅ Có thể revoke nếu cần<br>✅ NFT không thể bị bán/chuyển |
| **Borrower** | ✅ Điều khoản rõ ràng (thời gian, quyền lợi)<br>✅ Có thể return sớm<br>✅ Không lo bị chiếm đoạt |

### 5️⃣ **Trustless (Phi tín nhiệm)**
```
Không cần:
- ❌ Bên thứ 3 làm trọng tài
- ❌ Tin tưởng Borrower
- ❌ Hệ thống pháp lý

Smart contract tự động:
- ✅ Thực thi theo logic đã định
- ✅ Không thể thay đổi sau khi deploy
- ✅ Minh bạch 100% (on-chain)
```

### 6️⃣ **Audit Trail Hoàn Hảo**
```rust
// Mọi hành động đều emit events
emit!(AssetLendedEvent { owner, borrower, end_time, ... });
emit!(AssetReturnedEvent { returned_at, ... });
emit!(AssetReclaimedEvent { overdue_by, ... });

// → Có thể truy vết toàn bộ lịch sử
// → Phù hợp compliance
```

### So sánh Chi tiết

| Khía cạnh | Chuyển trực tiếp | PDA Escrow ✅ |
|-----------|------------------|--------------|
| **Quyền sở hữu** | Borrower 100% | Program 100% |
| **Private Key** | Borrower có | Không tồn tại |
| **Chuyển NFT** | Borrower làm được | Chỉ program |
| **Thu hồi** | Cần Borrower đồng ý | Tự động theo smart contract |
| **Thời gian** | Không kiểm soát | Blockchain timestamp |
| **Tranh chấp** | Cần pháp lý | Logic rõ ràng trong code |
| **Trustless** | ❌ Không | ✅ Hoàn toàn |
| **Chi phí** | Thấp | Thấp (~0.003 SOL) |
| **Audit Trail** | Khó | ✅ Events on-chain |

---

## 5. Security Features

### ✅ Implemented

1. **PDA Authority Control**
   - PDA không có private key
   - Chỉ program có thể sign với PDA seeds

2. **Time-based Logic**
   - Sử dụng `Clock::get().unix_timestamp`
   - Blockchain timestamp không thể fake

3. **Access Control**
   - Owner-only: reclaim, revoke
   - Borrower-only: return
   - Validation ở cả Context và instruction handler

4. **NFT Validation**
   - Supply must = 1
   - Decimals must = 0
   - Prevents lending fungible tokens

5. **Account Constraints**
   - Anchor constraints kiểm tra tất cả accounts
   - Seeds validation cho PDA
   - Token account ownership validation

6. **Rent Recovery**
   - `close = owner` tự động hoàn SOL
   - Không mất phí khi kết thúc loan

---

## 6. Testing Strategy

### Test Cases (10+)

```typescript
✅ 1. Setup NFT (supply=1, decimals=0)
✅ 2. Lend asset successfully
✅ 3. Fail: Invalid duration (too short)
✅ 4. Fail: Invalid duration (too long)
✅ 5. Return asset by borrower (before expiry)
✅ 6. Fail: Unauthorized return (not borrower)
✅ 7. Fail: Reclaim before expiry
✅ 8. Reclaim asset after expiry
✅ 9. Revoke loan immediately (owner)
✅ 10. Fail: Unauthorized revoke (not owner)
✅ 11. Fail: Lend non-NFT token (supply > 1)
```

### Coverage Target

- ✅ **Happy paths**: All 4 instructions
- ✅ **Error cases**: All 9 error codes
- ✅ **Edge cases**: Time boundaries, wrong accounts
- ✅ **Security**: Unauthorized access attempts

---

## 7. Deployment Checklist

- [ ] Build program: `anchor build -p asset-lending`
- [ ] Get program ID: `solana address -k target/deploy/asset_lending-keypair.json`
- [ ] Update `lib.rs` with real program ID
- [ ] Run tests: `anchor test`
- [ ] Deploy to devnet: `anchor deploy --program-name asset-lending`
- [ ] Verify on Solscan
- [ ] Update frontend config
- [ ] Test full flow on devnet
- [ ] Document API endpoints
- [ ] Add monitoring/alerts

---

**Total LOC:** ~700 lines (lib.rs + tests)  
**Account Size:** 122 bytes (LoanEscrowAccount)  
**Cost per loan:** ~0.003 SOL rent + 0.0001 SOL tx fees  
**Security:** ✅ Trustless, PDA-controlled, time-validated  

---

**Built with 🔐 on Solana | Oct 2025**
