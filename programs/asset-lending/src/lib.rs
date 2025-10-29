use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint, CloseAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("CdXqQDN1ifc1KpDtm1FaaSihqYrdasBsmfHqP77H9gHW");

// New modules for arbitrator system
mod state;
mod errors;
mod arbitrator;
mod verification;
mod dispute;

// Re-export for use in program
pub use state::*;
pub use errors::*;
pub use arbitrator::*;
pub use verification::*;
pub use dispute::*;

#[program]
pub mod asset_lending {
    use super::*;

    // ==================================================================
    // ARBITRATOR SYSTEM INSTRUCTIONS (NEW)
    // ==================================================================
    
    /// Initialize global configuration for arbitrator system
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        min_stake_amount: u64,
        dispute_fee: u64,
        dispute_window_duration: i64,
        voting_duration: i64,
    ) -> Result<()> {
        arbitrator::initialize_config(ctx, min_stake_amount, dispute_fee, dispute_window_duration, voting_duration)
    }

    /// Register as an arbitrator with stake
    pub fn register_arbitrator(
        ctx: Context<RegisterArbitrator>,
        stake_amount: u64,
    ) -> Result<()> {
        arbitrator::register_arbitrator(ctx, stake_amount)
    }

    /// Withdraw stake from arbitrator profile
    pub fn withdraw_stake(
        ctx: Context<WithdrawStake>,
        amount: u64,
    ) -> Result<()> {
        arbitrator::withdraw_stake(ctx, amount)
    }

    /// Slash arbitrator (admin only)
    pub fn slash_arbitrator(
        ctx: Context<SlashArbitrator>,
        arbitrator: Pubkey,
        amount: u64,
    ) -> Result<()> {
        arbitrator::slash_arbitrator(ctx, arbitrator, amount)
    }

    /// Assign M-of-N arbitrator set to loan
    pub fn assign_arbitrators(
        ctx: Context<AssignArbitrators>,
        arbitrator_set: Vec<Pubkey>,
        required_approvals: u8,
    ) -> Result<()> {
        verification::assign_arbitrators(ctx, arbitrator_set, required_approvals)
    }

    /// Borrower initiates return process
    pub fn initiate_return(
        ctx: Context<InitiateReturn>,
    ) -> Result<()> {
        verification::initiate_return(ctx)
    }

    /// Arbitrator verifies asset return
    pub fn arbitrator_verify_return(
        ctx: Context<ArbitratorVerifyReturn>,
    ) -> Result<()> {
        verification::arbitrator_verify_return(ctx)
    }

    /// Complete loan after M-of-N consensus
    pub fn complete_loan(
        ctx: Context<CompleteLoan>,
    ) -> Result<()> {
        verification::complete_loan(ctx)
    }

    /// Raise a dispute
    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
        evidence_link: String,
    ) -> Result<()> {
        dispute::raise_dispute(ctx, evidence_link)
    }

    /// Cast vote on dispute (council only)
    pub fn cast_appeal_vote(
        ctx: Context<CastAppealVote>,
        vote_for_complainant: bool,
    ) -> Result<()> {
        dispute::cast_appeal_vote(ctx, vote_for_complainant)
    }

    /// Resolve dispute after voting ends
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
    ) -> Result<()> {
        dispute::resolve_dispute(ctx)
    }

    /// Add council member (admin only)
    pub fn add_council_member(
        ctx: Context<AddCouncilMember>,
        member: Pubkey,
    ) -> Result<()> {
        dispute::add_council_member(ctx, member)
    }

    /// Remove council member (admin only)
    pub fn remove_council_member(
        ctx: Context<RemoveCouncilMember>,
        member: Pubkey,
    ) -> Result<()> {
        dispute::remove_council_member(ctx, member)
    }

    // ==================================================================
    // LEGACY LENDING INSTRUCTIONS (BACKWARD COMPATIBLE)
    // ==================================================================

    /// Khởi tạo khoản mượn - Owner cho mượn NFT cho Borrower
    /// NFT sẽ được ký quỹ trong PDA để đảm bảo an toàn
    pub fn lend_asset(
        ctx: Context<LendAsset>,
        borrower: Pubkey,
        loan_duration_seconds: i64,
    ) -> Result<()> {
        let loan_escrow = &mut ctx.accounts.loan_escrow;
        let clock = Clock::get()?;

        // Kiểm tra loan_duration hợp lệ (ít nhất 1 giờ, tối đa 1 năm)
        require!(
            loan_duration_seconds >= 3600 && loan_duration_seconds <= 31536000,
            LendingError::InvalidLoanDuration
        );

        // Khởi tạo thông tin khoản mượn
        loan_escrow.owner = ctx.accounts.owner.key();
        loan_escrow.borrower = borrower;
        loan_escrow.asset_mint = ctx.accounts.asset_mint.key();
        loan_escrow.loan_start_time = clock.unix_timestamp;
        loan_escrow.loan_end_time = clock.unix_timestamp
            .checked_add(loan_duration_seconds)
            .ok_or(LendingError::MathOverflow)?;
        loan_escrow.bump = ctx.bumps.loan_escrow;
        loan_escrow.status = LoanStatus::Active;

        // Chuyển NFT từ Owner vào PDA Escrow (ký quỹ)
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.owner_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, 1)?;

        emit!(AssetLendedEvent {
            loan_escrow: loan_escrow.key(),
            owner: loan_escrow.owner,
            borrower: loan_escrow.borrower,
            asset_mint: loan_escrow.asset_mint,
            loan_start_time: loan_escrow.loan_start_time,
            loan_end_time: loan_escrow.loan_end_time,
        });

        msg!(
            "✅ Asset lended: {} to {} until {}",
            loan_escrow.asset_mint,
            loan_escrow.borrower,
            loan_escrow.loan_end_time
        );

        Ok(())
    }

    /// Hoàn trả tài sản - Borrower trả lại NFT cho Owner
    /// Có thể trả sớm trước khi hết hạn
    pub fn return_asset(ctx: Context<ReturnAsset>) -> Result<()> {
        let clock = Clock::get()?;
        
        // Sao chép giá trị cần thiết TRƯỚC khi mutable borrow
        let asset_mint_key = ctx.accounts.loan_escrow.asset_mint;
        let owner_key = ctx.accounts.loan_escrow.owner;
        let borrower_key = ctx.accounts.loan_escrow.borrower;
        let bump = ctx.accounts.loan_escrow.bump;

        // Xác thực người gọi là Borrower
        require!(
            ctx.accounts.borrower.key() == borrower_key,
            LendingError::UnauthorizedBorrower
        );

        // Kiểm tra trạng thái khoản mượn
        require!(
            ctx.accounts.loan_escrow.status == LoanStatus::Active,
            LendingError::LoanNotActive
        );

        // Chuẩn bị seeds cho PDA signature
        let seeds = &[
            b"loan_escrow",
            owner_key.as_ref(),
            asset_mint_key.as_ref(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Chuyển NFT từ PDA Escrow về lại cho Owner
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

        // Cập nhật trạng thái khoản mượn (legacy status for backward compatibility)
        ctx.accounts.loan_escrow.status = LoanStatus::Returned;

        // Đóng Escrow Token Account và hoàn lại SOL cho Owner
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

        emit!(AssetReturnedEvent {
            loan_escrow: ctx.accounts.loan_escrow.key(),
            borrower: ctx.accounts.borrower.key(),
            asset_mint: asset_mint_key,
            returned_at: clock.unix_timestamp,
        });

        msg!(
            "✅ Asset returned: {} by borrower {}",
            asset_mint_key,
            ctx.accounts.borrower.key()
        );

        Ok(())
    }

    /// Thu hồi tài sản - Owner lấy lại NFT sau khi hết hạn
    /// Chỉ được phép sau khi loan_end_time
    pub fn reclaim_asset(ctx: Context<ReclaimAsset>) -> Result<()> {
        let clock = Clock::get()?;

        // Sao chép giá trị cần thiết TRƯỚC khi mutable borrow
        let asset_mint_key = ctx.accounts.loan_escrow.asset_mint;
        let owner_key = ctx.accounts.loan_escrow.owner;
        let bump = ctx.accounts.loan_escrow.bump;
        let loan_end_time = ctx.accounts.loan_escrow.loan_end_time;

        // Xác thực người gọi là Owner
        require!(
            ctx.accounts.owner.key() == owner_key,
            LendingError::UnauthorizedOwner
        );

        // Kiểm tra trạng thái khoản mượn
        require!(
            ctx.accounts.loan_escrow.status == LoanStatus::Active,
            LendingError::LoanNotActive
        );

        // KIỂM TRA CỐT LÕI: Thời gian hiện tại phải > loan_end_time
        require!(
            clock.unix_timestamp > loan_end_time,
            LendingError::LoanNotExpired
        );

        // Chuẩn bị seeds cho PDA signature
        let seeds = &[
            b"loan_escrow",
            owner_key.as_ref(),
            asset_mint_key.as_ref(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Chuyển NFT từ PDA Escrow về lại cho Owner
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

        // Cập nhật trạng thái khoản mượn (legacy status for backward compatibility)
        ctx.accounts.loan_escrow.status = LoanStatus::Reclaimed;

        // Đóng Escrow Token Account và hoàn lại SOL cho Owner
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

        emit!(AssetReclaimedEvent {
            loan_escrow: ctx.accounts.loan_escrow.key(),
            owner: ctx.accounts.owner.key(),
            asset_mint: asset_mint_key,
            reclaimed_at: clock.unix_timestamp,
            overdue_by: clock.unix_timestamp - loan_end_time,
        });

        msg!(
            "✅ Asset reclaimed: {} by owner {} (overdue by {} seconds)",
            asset_mint_key,
            ctx.accounts.owner.key(),
            clock.unix_timestamp - loan_end_time
        );

        Ok(())
    }

    /// Thu hồi sớm - Owner hủy khoản mượn và lấy lại NFT ngay lập tức
    /// Có thể sử dụng trong trường hợp khẩn cấp
    pub fn revoke_loan(ctx: Context<RevokeLoan>) -> Result<()> {
        let clock = Clock::get()?;
        
        // Sao chép giá trị cần thiết TRƯỚC khi mutable borrow
        let asset_mint_key = ctx.accounts.loan_escrow.asset_mint;
        let owner_key = ctx.accounts.loan_escrow.owner;
        let borrower_key = ctx.accounts.loan_escrow.borrower;
        let bump = ctx.accounts.loan_escrow.bump;

        // Xác thực người gọi là Owner
        require!(
            ctx.accounts.owner.key() == owner_key,
            LendingError::UnauthorizedOwner
        );

        // Kiểm tra trạng thái khoản mượn
        require!(
            ctx.accounts.loan_escrow.status == LoanStatus::Active,
            LendingError::LoanNotActive
        );

        // Chuẩn bị seeds cho PDA signature
        let seeds = &[
            b"loan_escrow",
            owner_key.as_ref(),
            asset_mint_key.as_ref(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Chuyển NFT từ PDA Escrow về lại cho Owner
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

        // Cập nhật trạng thái khoản mượn (legacy status for backward compatibility)
        ctx.accounts.loan_escrow.status = LoanStatus::Revoked;

        // Đóng Escrow Token Account và hoàn lại SOL cho Owner
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

        emit!(LoanRevokedEvent {
            loan_escrow: ctx.accounts.loan_escrow.key(),
            owner: ctx.accounts.owner.key(),
            borrower: borrower_key,
            asset_mint: asset_mint_key,
            revoked_at: clock.unix_timestamp,
        });

        msg!(
            "✅ Loan revoked: {} by owner {} (early termination)",
            asset_mint_key,
            ctx.accounts.owner.key()
        );

        Ok(())
    }
}

// ============================================================================
// Context Structures (Instructions)
// Note: LoanEscrowAccount and LoanStatus are now in state.rs with extended fields
// ============================================================================

/// Context cho instruction: lend_asset
#[derive(Accounts)]
#[instruction(borrower: Pubkey)]
pub struct LendAsset<'info> {
    /// Chủ sở hữu tài sản (người cho mượn)
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Tài khoản PDA lưu trữ thông tin khoản mượn
    #[account(
        init,
        payer = owner,
        space = LoanEscrowAccount::MAX_SIZE,
        seeds = [
            b"loan_escrow",
            owner.key().as_ref(),
            asset_mint.key().as_ref()
        ],
        bump
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,

    /// Mint account của NFT
    #[account(
        constraint = asset_mint.supply == 1 @ LendingError::NotNFT,
        constraint = asset_mint.decimals == 0 @ LendingError::NotNFT,
    )]
    pub asset_mint: Account<'info, Mint>,

    /// Token account của Owner chứa NFT
    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key() @ LendingError::InvalidTokenAccount,
        constraint = owner_token_account.mint == asset_mint.key() @ LendingError::InvalidTokenAccount,
        constraint = owner_token_account.amount == 1 @ LendingError::InsufficientTokens,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    /// Token account của PDA Escrow để nhận NFT
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

/// Context cho instruction: return_asset
#[derive(Accounts)]
pub struct ReturnAsset<'info> {
    /// Người mượn (người trả lại NFT)
    #[account(mut)]
    pub borrower: Signer<'info>,

    /// Chủ sở hữu tài sản (người nhận lại NFT)
    /// CHECK: Sẽ được xác thực thông qua loan_escrow.owner
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,

    /// Tài khoản PDA lưu trữ thông tin khoản mượn
    #[account(
        mut,
        close = owner,
        seeds = [
            b"loan_escrow",
            loan_escrow.owner.as_ref(),
            loan_escrow.asset_mint.as_ref()
        ],
        bump = loan_escrow.bump,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,

    /// Token account của PDA Escrow chứa NFT
    #[account(
        mut,
        constraint = escrow_token_account.mint == loan_escrow.asset_mint @ LendingError::InvalidTokenAccount,
        constraint = escrow_token_account.amount == 1 @ LendingError::InsufficientTokens,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// Token account của Owner để nhận lại NFT
    #[account(
        mut,
        constraint = owner_token_account.owner == loan_escrow.owner @ LendingError::InvalidTokenAccount,
        constraint = owner_token_account.mint == loan_escrow.asset_mint @ LendingError::InvalidTokenAccount,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

/// Context cho instruction: reclaim_asset
#[derive(Accounts)]
pub struct ReclaimAsset<'info> {
    /// Chủ sở hữu tài sản (người thu hồi NFT)
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Tài khoản PDA lưu trữ thông tin khoản mượn
    #[account(
        mut,
        close = owner,
        seeds = [
            b"loan_escrow",
            loan_escrow.owner.as_ref(),
            loan_escrow.asset_mint.as_ref()
        ],
        bump = loan_escrow.bump,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,

    /// Token account của PDA Escrow chứa NFT
    #[account(
        mut,
        constraint = escrow_token_account.mint == loan_escrow.asset_mint @ LendingError::InvalidTokenAccount,
        constraint = escrow_token_account.amount == 1 @ LendingError::InsufficientTokens,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// Token account của Owner để nhận lại NFT
    #[account(
        mut,
        constraint = owner_token_account.owner == loan_escrow.owner @ LendingError::InvalidTokenAccount,
        constraint = owner_token_account.mint == loan_escrow.asset_mint @ LendingError::InvalidTokenAccount,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

/// Context cho instruction: revoke_loan
#[derive(Accounts)]
pub struct RevokeLoan<'info> {
    /// Chủ sở hữu tài sản (người hủy khoản mượn)
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Tài khoản PDA lưu trữ thông tin khoản mượn
    #[account(
        mut,
        close = owner,
        seeds = [
            b"loan_escrow",
            loan_escrow.owner.as_ref(),
            loan_escrow.asset_mint.as_ref()
        ],
        bump = loan_escrow.bump,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,

    /// Token account của PDA Escrow chứa NFT
    #[account(
        mut,
        constraint = escrow_token_account.mint == loan_escrow.asset_mint @ LendingError::InvalidTokenAccount,
        constraint = escrow_token_account.amount == 1 @ LendingError::InsufficientTokens,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// Token account của Owner để nhận lại NFT
    #[account(
        mut,
        constraint = owner_token_account.owner == loan_escrow.owner @ LendingError::InvalidTokenAccount,
        constraint = owner_token_account.mint == loan_escrow.asset_mint @ LendingError::InvalidTokenAccount,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct AssetLendedEvent {
    pub loan_escrow: Pubkey,
    pub owner: Pubkey,
    pub borrower: Pubkey,
    pub asset_mint: Pubkey,
    pub loan_start_time: i64,
    pub loan_end_time: i64,
}

#[event]
pub struct AssetReturnedEvent {
    pub loan_escrow: Pubkey,
    pub borrower: Pubkey,
    pub asset_mint: Pubkey,
    pub returned_at: i64,
}

#[event]
pub struct AssetReclaimedEvent {
    pub loan_escrow: Pubkey,
    pub owner: Pubkey,
    pub asset_mint: Pubkey,
    pub reclaimed_at: i64,
    pub overdue_by: i64,
}

#[event]
pub struct LoanRevokedEvent {
    pub loan_escrow: Pubkey,
    pub owner: Pubkey,
    pub borrower: Pubkey,
    pub asset_mint: Pubkey,
    pub revoked_at: i64,
}

// ============================================================================
// Error Codes - Now defined in errors.rs and re-exported
// ============================================================================
// See errors.rs for all error definitions
