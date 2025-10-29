use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, CloseAccount};
use crate::state::*;
use crate::errors::*;

/// Giám định viên xác nhận tài sản đã được trả (M-of-N verification)
#[derive(Accounts)]
pub struct ArbitratorVerifyReturn<'info> {
    /// Giám định viên thực hiện xác nhận
    pub arbitrator: Signer<'info>,
    
    /// Profile của giám định viên
    #[account(
        seeds = [b"arbitrator", arbitrator.key().as_ref()],
        bump = arbitrator_profile.bump,
        constraint = arbitrator_profile.authority == arbitrator.key(),
        constraint = arbitrator_profile.is_active @ LendingError::ArbitratorNotActive,
    )]
    pub arbitrator_profile: Account<'info, ArbitratorProfile>,
    
    /// Tài khoản khoản mượn
    #[account(
        mut,
        constraint = loan_escrow.status == LoanStatus::ReturnPending @ LendingError::InvalidLoanStatus,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,
    
    /// Global config
    #[account(
        seeds = [b"global_config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
}

/// Hoàn tất khoản mượn (được gọi tự động khi đủ M xác nhận)
#[derive(Accounts)]
pub struct CompleteLoan<'info> {
    /// Chủ sở hữu (nhận lại NFT)
    /// CHECK: Verified via loan_escrow.owner
    #[account(mut)]
    pub owner: AccountInfo<'info>,
    
    /// Tài khoản khoản mượn
    #[account(
        mut,
        has_one = owner,
        constraint = loan_escrow.status == LoanStatus::Completed @ LendingError::InvalidLoanStatus,
        close = owner, // Đóng account và trả rent về owner
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,
    
    /// Token account của Owner (nhận NFT)
    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key(),
        constraint = owner_token_account.mint == loan_escrow.asset_mint,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    
    /// Token account của Escrow (nguồn NFT)
    #[account(
        mut,
        constraint = escrow_token_account.mint == loan_escrow.asset_mint,
        constraint = escrow_token_account.amount == 1,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

/// Implementations

pub fn arbitrator_verify_return(
    ctx: Context<ArbitratorVerifyReturn>,
) -> Result<()> {
    let loan_escrow = &mut ctx.accounts.loan_escrow;
    let arbitrator_key = ctx.accounts.arbitrator.key();
    let clock = Clock::get()?;
    
    // 1. Kiểm tra arbitrator có trong arbitrator_set không
    require!(
        loan_escrow.arbitrator_set.contains(&arbitrator_key),
        LendingError::ArbitratorNotInSet
    );
    
    // 2. Kiểm tra chưa approve trước đó
    require!(
        !loan_escrow.approvals.contains(&arbitrator_key),
        LendingError::AlreadyApproved
    );
    
    // 3. Thêm vào danh sách approvals
    loan_escrow.approvals.push(arbitrator_key);
    
    // 4. Nếu đây là lần verify đầu tiên, mở cửa sổ tranh chấp
    if loan_escrow.dispute_window_start == 0 {
        loan_escrow.dispute_window_start = clock.unix_timestamp;
    }
    
    // 5. Cập nhật reputation của arbitrator
    let arbitrator_profile = &mut ctx.accounts.arbitrator_profile;
    arbitrator_profile.verified_count += 1;
    arbitrator_profile.reputation_score += 5; // Thưởng 5 điểm
    
    msg!("✅ Arbitrator verified return: {}", arbitrator_key);
    msg!("   Approvals: {}/{}", loan_escrow.approvals.len(), loan_escrow.required_approvals);
    
    // 6. Kiểm tra đồng thuận (M-of-N)
    if loan_escrow.approvals.len() >= loan_escrow.required_approvals as usize {
        // Đạt đồng thuận! Hoàn tất khoản mượn
        loan_escrow.status = LoanStatus::Completed;
        msg!("🎉 Consensus reached! Loan completed.");
        
        // Note: Việc chuyển NFT và đóng account sẽ được thực hiện
        // trong instruction `complete_loan` riêng để tránh CPI phức tạp
    }
    
    Ok(())
}

pub fn complete_loan(ctx: Context<CompleteLoan>) -> Result<()> {
    let loan_escrow = &ctx.accounts.loan_escrow;
    
    // Kiểm tra đã có đủ approvals
    require!(
        loan_escrow.approvals.len() >= loan_escrow.required_approvals as usize,
        LendingError::InsufficientApprovals
    );
    
    // PDA signer seeds
    let owner_key = loan_escrow.owner;
    let mint_key = loan_escrow.asset_mint;
    let seeds = &[
        b"loan_escrow",
        owner_key.as_ref(),
        mint_key.as_ref(),
        &[loan_escrow.bump],
    ];
    let signer = &[&seeds[..]];
    
    // Chuyển NFT từ escrow về owner
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.owner_token_account.to_account_info(),
            authority: loan_escrow.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_ctx, 1)?;
    
    // Đóng escrow token account
    let close_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.escrow_token_account.to_account_info(),
            destination: ctx.accounts.owner.to_account_info(),
            authority: loan_escrow.to_account_info(),
        },
        signer,
    );
    token::close_account(close_ctx)?;
    
    msg!("✅ Loan completed - NFT returned to owner");
    msg!("   Owner: {}", loan_escrow.owner);
    msg!("   Asset: {}", loan_escrow.asset_mint);
    
    Ok(())
}

/// Chức năng phụ: Chủ sở hữu chỉ định arbitrator set cho khoản mượn
#[derive(Accounts)]
pub struct AssignArbitrators<'info> {
    /// Chủ sở hữu
    pub owner: Signer<'info>,
    
    /// Tài khoản khoản mượn
    #[account(
        mut,
        has_one = owner,
        constraint = loan_escrow.status == LoanStatus::Active @ LendingError::InvalidLoanStatus,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,
}

pub fn assign_arbitrators(
    ctx: Context<AssignArbitrators>,
    arbitrator_set: Vec<Pubkey>,
    required_approvals: u8,
) -> Result<()> {
    let loan_escrow = &mut ctx.accounts.loan_escrow;
    
    // Kiểm tra valid M-of-N
    require!(
        arbitrator_set.len() >= required_approvals as usize,
        LendingError::InsufficientApprovals
    );
    require!(
        arbitrator_set.len() <= 10,
        LendingError::InvalidLoanStatus // Reuse error
    );
    
    loan_escrow.arbitrator_set = arbitrator_set.clone();
    loan_escrow.required_approvals = required_approvals;
    loan_escrow.approvals = Vec::new();
    
    msg!("✅ Arbitrators assigned");
    msg!("   Set size (N): {}", arbitrator_set.len());
    msg!("   Required approvals (M): {}", required_approvals);
    
    Ok(())
}

/// Borrower đánh dấu tài sản đã trả (trigger verification process)
#[derive(Accounts)]
pub struct InitiateReturn<'info> {
    /// Người mượn
    pub borrower: Signer<'info>,
    
    /// Tài khoản khoản mượn
    #[account(
        mut,
        constraint = loan_escrow.borrower == borrower.key(),
        constraint = loan_escrow.status == LoanStatus::Active @ LendingError::InvalidLoanStatus,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,
}

pub fn initiate_return(ctx: Context<InitiateReturn>) -> Result<()> {
    let loan_escrow = &mut ctx.accounts.loan_escrow;
    
    // Đổi status sang ReturnPending để arbitrators bắt đầu verify
    loan_escrow.status = LoanStatus::ReturnPending;
    
    msg!("✅ Return initiated by borrower");
    msg!("   Loan: {}", loan_escrow.key());
    msg!("   Awaiting {}/{} arbitrator verifications", 0, loan_escrow.required_approvals);
    
    Ok(())
}
