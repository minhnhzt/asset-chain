use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Burn};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("11111111111111111111111111111112"); // Replace with your program ID after deployment

/// Maximum number of maintenance log entries per asset to prevent account bloat
const MAX_LOG_ENTRIES: usize = 50;

/// Maximum length for string fields to prevent excessive storage costs
const MAX_STRING_LENGTH: usize = 256;

/// Asset status constants
pub mod asset_status {
    pub const ACTIVE: u8 = 0;
    pub const MAINTENANCE: u8 = 1;
    pub const RETIRED: u8 = 2;
    pub const DISPOSED: u8 = 3;
}

#[program]
pub mod asset_manager {
    use super::*;

    /// Initialize the global asset manager state
    /// This should be called once when deploying the program
    pub fn initialize_asset_manager(ctx: Context<InitializeAssetManager>) -> Result<()> {
        let asset_manager = &mut ctx.accounts.asset_manager;
        asset_manager.authority = ctx.accounts.authority.key();
        asset_manager.total_assets = 0;
        asset_manager.bump = [ctx.bumps.asset_manager];
        
        msg!("Asset Manager initialized with authority: {}", asset_manager.authority);
        Ok(())
    }

    /// Create a new asset and mint an SPL token to represent it
    pub fn create_asset(
        ctx: Context<CreateAsset>,
        metadata_cid: String,
        _decimals: u8,
    ) -> Result<()> {
        // Validate metadata CID length
        require!(
            metadata_cid.len() <= MAX_STRING_LENGTH,
            AssetManagerError::StringTooLong
        );

        let bump = ctx.bumps.asset_account;
        
        // Initialize asset account
        {
            let asset_account = &mut ctx.accounts.asset_account;
            asset_account.owner = ctx.accounts.owner.key();
            asset_account.mint = ctx.accounts.mint.key();
            asset_account.metadata_cid = metadata_cid.clone();
            asset_account.status = asset_status::ACTIVE;
            asset_account.creation_time = Clock::get()?.unix_timestamp;
            asset_account.last_update = Clock::get()?.unix_timestamp;
            asset_account.bump = [bump];
        }

        // Increment total assets counter
        {
            let asset_manager = &mut ctx.accounts.asset_manager;
            asset_manager.total_assets = asset_manager
                .total_assets
                .checked_add(1)
                .ok_or(AssetManagerError::MathOverflow)?;
        }

        // Mint 1 token to represent the asset (NFT-style)
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.asset_account.to_account_info(),
        };

        let seeds = &[
            b"asset",
            ctx.accounts.mint.to_account_info().key.as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::mint_to(cpi_ctx, 1)?; // Mint 1 token (NFT-style)

        msg!(
            "Asset created with mint: {}, metadata CID: {}",
            ctx.accounts.mint.key(),
            metadata_cid
        );

        Ok(())
    }

    /// Update asset metadata (only owner can update)
    pub fn update_asset(
        ctx: Context<UpdateAsset>,
        new_metadata_cid: String,
        new_status: u8,
    ) -> Result<()> {
        // Validate inputs
        require!(
            new_metadata_cid.len() <= MAX_STRING_LENGTH,
            AssetManagerError::StringTooLong
        );
        require!(
            new_status <= asset_status::DISPOSED,
            AssetManagerError::InvalidStatus
        );

        let asset_account = &mut ctx.accounts.asset_account;
        
        // Update asset data
        asset_account.metadata_cid = new_metadata_cid.clone();
        asset_account.status = new_status;
        asset_account.last_update = Clock::get()?.unix_timestamp;

        msg!(
            "Asset {} updated with new metadata CID: {}, status: {}",
            asset_account.mint,
            new_metadata_cid,
            new_status
        );

        Ok(())
    }

    /// Initialize maintenance log for an asset
    pub fn initialize_maintenance_log(ctx: Context<InitializeMaintenanceLog>) -> Result<()> {
        let maintenance_log = &mut ctx.accounts.maintenance_log;
        maintenance_log.asset = ctx.accounts.asset_account.key();
        maintenance_log.logs = Vec::new();
        maintenance_log.bump = [ctx.bumps.maintenance_log];

        msg!("Maintenance log initialized for asset: {}", maintenance_log.asset);
        Ok(())
    }

    /// Add a maintenance log entry
    pub fn add_maintenance_log(
        ctx: Context<AddMaintenanceLog>,
        action: String,
        details_cid: String,
    ) -> Result<()> {
        // Validate input lengths
        require!(
            action.len() <= MAX_STRING_LENGTH,
            AssetManagerError::StringTooLong
        );
        require!(
            details_cid.len() <= MAX_STRING_LENGTH,
            AssetManagerError::StringTooLong
        );

        let maintenance_log = &mut ctx.accounts.maintenance_log;
        
        // Check if we've reached the maximum number of log entries
        require!(
            maintenance_log.logs.len() < MAX_LOG_ENTRIES,
            AssetManagerError::MaxLogEntriesReached
        );

        // Create new log entry
        let log_entry = LogEntry {
            timestamp: Clock::get()?.unix_timestamp,
            action,
            details_cid: details_cid.clone(),
            performer: ctx.accounts.performer.key(),
        };

        // Add to logs and reallocate if needed
        maintenance_log.logs.push(log_entry);

        // Update asset's last update time
        let asset_account = &mut ctx.accounts.asset_account;
        asset_account.last_update = Clock::get()?.unix_timestamp;

        msg!(
            "Maintenance log added for asset: {}, details CID: {}",
            maintenance_log.asset,
            details_cid
        );

        Ok(())
    }

    /// Retire an asset (burn the token)
    pub fn retire_asset(ctx: Context<RetireAsset>) -> Result<()> {
        let asset_account = &mut ctx.accounts.asset_account;
        
        // Update status to retired
        asset_account.status = asset_status::RETIRED;
        asset_account.last_update = Clock::get()?.unix_timestamp;

        // Burn the asset token
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::burn(cpi_ctx, 1)?; // Burn the 1 token representing the asset

        msg!("Asset {} retired and token burned", asset_account.mint);
        Ok(())
    }
}

/// Global program state account
#[account]
pub struct AssetManager {
    /// Program authority (typically the deployer)
    pub authority: Pubkey,
    /// Total number of assets created
    pub total_assets: u64,
    /// PDA bump seed
    pub bump: [u8; 1],
}

impl AssetManager {
    pub const LEN: usize = 32 + 8 + 1; // Pubkey + u64 + [u8; 1]
}

/// Individual asset account
#[account]
pub struct AssetAccount {
    /// Owner of the asset
    pub owner: Pubkey,
    /// Mint address of the SPL token representing this asset
    pub mint: Pubkey,
    /// IPFS CID for off-chain metadata
    pub metadata_cid: String,
    /// Current status of the asset
    pub status: u8,
    /// Unix timestamp when asset was created
    pub creation_time: i64,
    /// Unix timestamp of last update
    pub last_update: i64,
    /// PDA bump seed
    pub bump: [u8; 1],
}

impl AssetAccount {
    pub const LEN: usize = 32 + 32 + (4 + MAX_STRING_LENGTH) + 1 + 8 + 8 + 1; // Dynamic string + fixed fields
}

/// Maintenance log account for tracking asset maintenance history
#[account]
pub struct MaintenanceLog {
    /// Asset this log belongs to
    pub asset: Pubkey,
    /// Vector of log entries (capped at MAX_LOG_ENTRIES)
    pub logs: Vec<LogEntry>,
    /// PDA bump seed
    pub bump: [u8; 1],
}

impl MaintenanceLog {
    pub const LEN: usize = 32 + (4 + MAX_LOG_ENTRIES * LogEntry::LEN) + 1;
}

/// Individual maintenance log entry
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct LogEntry {
    /// Unix timestamp of the maintenance action
    pub timestamp: i64,
    /// Description of the maintenance action
    pub action: String,
    /// IPFS CID for detailed maintenance information
    pub details_cid: String,
    /// Pubkey of the person who performed the maintenance
    pub performer: Pubkey,
}

impl LogEntry {
    pub const LEN: usize = 8 + (4 + MAX_STRING_LENGTH) + (4 + MAX_STRING_LENGTH) + 32;
}

// Context structs for instruction accounts

#[derive(Accounts)]
pub struct InitializeAssetManager<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + AssetManager::LEN,
        seeds = [b"asset_manager"],
        bump
    )]
    pub asset_manager: Account<'info, AssetManager>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateAsset<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AssetAccount::LEN,
        seeds = [b"asset", mint.key().as_ref()],
        bump
    )]
    pub asset_account: Account<'info, AssetAccount>,
    
    #[account(
        mut,
        seeds = [b"asset_manager"],
        bump = asset_manager.bump[0]
    )]
    pub asset_manager: Account<'info, AssetManager>,
    
    #[account(
        init,
        payer = owner,
        mint::decimals = 0, // NFT-style token
        mint::authority = asset_account,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateAsset<'info> {
    #[account(
        mut,
        seeds = [b"asset", asset_account.mint.as_ref()],
        bump = asset_account.bump[0],
        has_one = owner @ AssetManagerError::UnauthorizedAccess
    )]
    pub asset_account: Account<'info, AssetAccount>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeMaintenanceLog<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + MaintenanceLog::LEN,
        seeds = [b"maintenance_log", asset_account.key().as_ref()],
        bump
    )]
    pub maintenance_log: Account<'info, MaintenanceLog>,
    
    #[account(
        seeds = [b"asset", asset_account.mint.as_ref()],
        bump = asset_account.bump[0]
    )]
    pub asset_account: Account<'info, AssetAccount>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddMaintenanceLog<'info> {
    #[account(
        mut,
        seeds = [b"maintenance_log", asset_account.key().as_ref()],
        bump = maintenance_log.bump[0],
        realloc = 8 + MaintenanceLog::LEN,
        realloc::payer = performer,
        realloc::zero = false,
    )]
    pub maintenance_log: Account<'info, MaintenanceLog>,
    
    #[account(
        mut,
        seeds = [b"asset", asset_account.mint.as_ref()],
        bump = asset_account.bump[0]
    )]
    pub asset_account: Account<'info, AssetAccount>,
    
    #[account(mut)]
    pub performer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RetireAsset<'info> {
    #[account(
        mut,
        seeds = [b"asset", asset_account.mint.as_ref()],
        bump = asset_account.bump[0],
        has_one = owner @ AssetManagerError::UnauthorizedAccess
    )]
    pub asset_account: Account<'info, AssetAccount>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// Custom error types
#[error_code]
pub enum AssetManagerError {
    #[msg("String too long")]
    StringTooLong,
    
    #[msg("Invalid asset status")]
    InvalidStatus,
    
    #[msg("Maximum log entries reached")]
    MaxLogEntriesReached,
    
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    
    #[msg("Math overflow")]
    MathOverflow,
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;
    
    // Helper function to create a test context (you'll need to expand this for actual tests)
    fn create_test_context() {
        // Test setup code would go here
        // This is a placeholder for the actual test implementation
    }
    
    #[test]
    fn test_asset_manager_initialization() {
        // Test the initialize_asset_manager instruction
        // Implementation would depend on your testing framework setup
    }
    
    #[test]
    fn test_asset_creation() {
        // Test the create_asset instruction
    }
    
    #[test]
    fn test_maintenance_logging() {
        // Test the maintenance log functionality
    }
    
    #[test]
    fn test_asset_retirement() {
        // Test the retire_asset instruction
    }
}