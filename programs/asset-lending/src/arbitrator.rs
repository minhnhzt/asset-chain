use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::*;
use crate::errors::*;

/// Initialize Global Configuration (chỉ gọi 1 lần)
#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = GlobalConfig::MAX_SIZE,
        seeds = [b"global_config"],
        bump
    )]
    pub config: Account<'info, GlobalConfig>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// Kho bạc DAO
    /// CHECK: Safe - chỉ lưu địa chỉ
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Đăng ký trở thành Giám định viên
#[derive(Accounts)]
pub struct RegisterArbitrator<'info> {
    #[account(
        init,
        payer = authority,
        space = ArbitratorProfile::SIZE,
        seeds = [b"arbitrator", authority.key().as_ref()],
        bump
    )]
    pub arbitrator_profile: Account<'info, ArbitratorProfile>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Vault chứa tiền stake (PDA owned by program)
    #[account(
        init,
        payer = authority,
        token::mint = stake_mint,
        token::authority = arbitrator_profile,
        seeds = [b"stake_vault", authority.key().as_ref()],
        bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
    /// Token account của arbitrator (nguồn tiền stake)
    #[account(
        mut,
        constraint = arbitrator_token_account.owner == authority.key(),
        constraint = arbitrator_token_account.mint == stake_mint.key(),
    )]
    pub arbitrator_token_account: Account<'info, TokenAccount>,
    
    /// Mint của token stake (USDC)
    pub stake_mint: Account<'info, Mint>,
    
    /// Global config để check min_stake_amount
    #[account(
        seeds = [b"global_config"],
        bump = config.bump
    )]
    pub config: Account<'info, GlobalConfig>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

/// Rút tiền stake (khi không còn tham gia)
#[derive(Accounts)]
pub struct WithdrawStake<'info> {
    #[account(
        mut,
        seeds = [b"arbitrator", authority.key().as_ref()],
        bump = arbitrator_profile.bump,
        has_one = authority,
        has_one = stake_vault,
    )]
    pub arbitrator_profile: Account<'info, ArbitratorProfile>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Vault chứa tiền stake
    #[account(
        mut,
        seeds = [b"stake_vault", authority.key().as_ref()],
        bump,
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
    /// Token account đích (nhận tiền về)
    #[account(
        mut,
        constraint = destination_token_account.owner == authority.key(),
        constraint = destination_token_account.mint == stake_vault.mint,
    )]
    pub destination_token_account: Account<'info, TokenAccount>,
    
    /// Global config để kiểm tra min_stake_amount
    #[account(
        seeds = [b"global_config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
    
    pub token_program: Program<'info, Token>,
}

/// Phạt (slash) Giám định viên
#[derive(Accounts)]
#[instruction(arbitrator_authority: Pubkey)]
pub struct SlashArbitrator<'info> {
    #[account(
        mut,
        seeds = [b"arbitrator", arbitrator_authority.as_ref()],
        bump = arbitrator_profile.bump,
    )]
    pub arbitrator_profile: Account<'info, ArbitratorProfile>,
    
    /// Vault của arbitrator bị slash
    #[account(
        mut,
        seeds = [b"stake_vault", arbitrator_authority.as_ref()],
        bump,
        constraint = stake_vault.key() == arbitrator_profile.stake_vault,
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
    /// Kho bạc DAO (nhận tiền phạt)
    #[account(
        mut,
        constraint = treasury.key() == config.treasury,
    )]
    pub treasury: Account<'info, TokenAccount>,
    
    /// Global config
    #[account(
        seeds = [b"global_config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
    
    /// Người gọi phải là admin hoặc dispute resolver
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

/// Implementations

pub fn initialize_config(
    ctx: Context<InitializeConfig>,
    min_stake_amount: u64,
    dispute_fee: u64,
    dispute_window_duration: i64,
    voting_duration: i64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    config.admin = ctx.accounts.admin.key();
    config.treasury = ctx.accounts.treasury.key();
    config.min_stake_amount = min_stake_amount;
    config.dispute_fee = dispute_fee;
    config.dispute_window_duration = dispute_window_duration;
    config.voting_duration = voting_duration;
    config.council_members = Vec::new();
    config.bump = ctx.bumps.config;
    
    msg!("✅ Global config initialized");
    msg!("   Min stake: {}", min_stake_amount);
    msg!("   Dispute fee: {}", dispute_fee);
    
    Ok(())
}

pub fn register_arbitrator(
    ctx: Context<RegisterArbitrator>,
    stake_amount: u64,
) -> Result<()> {
    let config = &ctx.accounts.config;
    
    // Kiểm tra stake amount >= minimum
    require!(
        stake_amount >= config.min_stake_amount,
        LendingError::InsufficientStake
    );
    
    // Chuyển tiền từ arbitrator vào stake_vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.arbitrator_token_account.to_account_info(),
            to: ctx.accounts.stake_vault.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, stake_amount)?;
    
    // Khởi tạo profile
    let profile = &mut ctx.accounts.arbitrator_profile;
    profile.authority = ctx.accounts.authority.key();
    profile.stake_vault = ctx.accounts.stake_vault.key();
    profile.stake_amount = stake_amount;
    profile.is_active = true;
    profile.reputation_score = 100; // Điểm khởi đầu
    profile.verified_count = 0;
    profile.slashed_count = 0;
    profile.bump = ctx.bumps.arbitrator_profile;
    
    msg!("✅ Arbitrator registered: {}", profile.authority);
    msg!("   Stake amount: {}", stake_amount);
    
    Ok(())
}

pub fn withdraw_stake(
    ctx: Context<WithdrawStake>,
    amount: u64,
) -> Result<()> {
    let profile = &mut ctx.accounts.arbitrator_profile;
    let config = &ctx.accounts.config;
    
    // Kiểm tra số dư
    require!(
        amount <= profile.stake_amount,
        LendingError::InsufficientStake
    );
    
    // PDA signer seeds
    let authority_key = ctx.accounts.authority.key();
    let seeds = &[
        b"arbitrator",
        authority_key.as_ref(),
        &[profile.bump],
    ];
    let signer = &[&seeds[..]];
    
    // Chuyển tiền từ vault về cho arbitrator
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.stake_vault.to_account_info(),
            to: ctx.accounts.destination_token_account.to_account_info(),
            authority: profile.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_ctx, amount)?;
    
    // Cập nhật stake amount
    profile.stake_amount = profile.stake_amount.checked_sub(amount).unwrap();
    
    // Nếu stake < minimum thì set inactive
    if profile.stake_amount < config.min_stake_amount {
        profile.is_active = false;
    }
    
    msg!("✅ Stake withdrawn: {}", amount);
    msg!("   Remaining stake: {}", profile.stake_amount);
    msg!("   Is active: {}", profile.is_active);
    
    Ok(())
}

pub fn slash_arbitrator(
    ctx: Context<SlashArbitrator>,
    arbitrator_authority: Pubkey,
    slash_amount: u64,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let profile = &mut ctx.accounts.arbitrator_profile;
    
    // Kiểm tra quyền: phải là admin
    require!(
        ctx.accounts.authority.key() == config.admin,
        LendingError::UnauthorizedSlash
    );
    
    // Kiểm tra số dư
    require!(
        slash_amount <= profile.stake_amount,
        LendingError::InsufficientStake
    );
    
    // PDA signer seeds
    let seeds = &[
        b"arbitrator",
        arbitrator_authority.as_ref(),
        &[profile.bump],
    ];
    let signer = &[&seeds[..]];
    
    // Chuyển tiền từ stake_vault sang treasury
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.stake_vault.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            authority: profile.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_ctx, slash_amount)?;
    
    // Cập nhật profile
    profile.stake_amount = profile.stake_amount.checked_sub(slash_amount).unwrap();
    profile.slashed_count += 1;
    profile.reputation_score = profile.reputation_score.saturating_sub(50); // Giảm 50 điểm
    
    // Nếu stake < minimum thì set inactive
    if profile.stake_amount < config.min_stake_amount {
        profile.is_active = false;
    }
    
    msg!("⚠️  Arbitrator slashed: {}", arbitrator_authority);
    msg!("   Slash amount: {}", slash_amount);
    msg!("   New reputation: {}", profile.reputation_score);
    
    Ok(())
}
