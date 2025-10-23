use anchor_lang::prelude::*;

// Maximum lengths for string fields to prevent account bloat
pub const MAX_ASSET_NAME_LENGTH: usize = 128;
pub const MAX_LOCATION_LENGTH: usize = 256;
pub const MAX_IPFS_CID_LENGTH: usize = 256;
pub const MAX_MAINTENANCE_NOTE_LENGTH: usize = 256;
pub const MAX_MAINTENANCE_LOGS: usize = 50;

/// Main Asset account - represents a registered asset
#[account]
pub struct Asset {
    /// Owner/creator of the asset
    pub owner: Pubkey,
    /// Asset name
    pub name: String,
    /// Asset location
    pub location: String,
    /// IPFS CID for off-chain metadata (mutable)
    pub metadata_cid: String,
    /// Current status of the asset (ACTIVE, MAINTENANCE, RETIRED, DISPOSED)
    pub status: AssetStatus,
    /// Timestamp when asset was created
    pub created_at: i64,
    /// Timestamp of last metadata update
    pub updated_at: i64,
    /// Bump seed for PDA derivation
    pub bump: u8,
}

/// Asset status enum
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AssetStatus {
    Active = 0,
    Maintenance = 1,
    Retired = 2,
    Disposed = 3,
}

impl AssetStatus {
    pub fn from_u8(value: u8) -> Result<Self> {
        match value {
            0 => Ok(AssetStatus::Active),
            1 => Ok(AssetStatus::Maintenance),
            2 => Ok(AssetStatus::Retired),
            3 => Ok(AssetStatus::Disposed),
            _ => Err(error!(ErrorCode::InvalidAssetStatus)),
        }
    }
}

impl Default for AssetStatus {
    fn default() -> Self {
        AssetStatus::Active
    }
}

/// Maintenance log entry
#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct MaintenanceLogEntry {
    /// Who performed the maintenance
    pub performer: Pubkey,
    /// Maintenance note
    pub note: String,
    /// Timestamp when maintenance was logged
    pub timestamp: i64,
    /// IPFS CID for detailed maintenance data
    pub ipfs_cid: String,
}

/// Maintenance log account for a specific asset
#[account]
pub struct MaintenanceLog {
    /// Reference to the asset
    pub asset: Pubkey,
    /// Owner of the asset
    pub owner: Pubkey,
    /// Array of maintenance log entries (capped at MAX_MAINTENANCE_LOGS)
    pub entries: Vec<MaintenanceLogEntry>,
    /// Bump seed for PDA derivation
    pub bump: u8,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid asset status")]
    InvalidAssetStatus,

    #[msg("Asset name too long")]
    AssetNameTooLong,

    #[msg("Location too long")]
    LocationTooLong,

    #[msg("IPFS CID too long")]
    IpfsCidTooLong,

    #[msg("Maintenance note too long")]
    MaintenanceNoteTooLong,

    #[msg("Maintenance log is full")]
    MaintenanceLogFull,

    #[msg("Unauthorized - signer is not the owner")]
    Unauthorized,

    #[msg("Invalid maintenance log entry")]
    InvalidMaintenanceEntry,
}
